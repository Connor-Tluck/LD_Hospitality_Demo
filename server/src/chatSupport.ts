import { init, type LDClient, type LDContext } from "@launchdarkly/node-server-sdk";
import { initAi, type LDAIClient } from "@launchdarkly/server-sdk-ai";
import OpenAI from "openai";
import { getUserIdForToken, usersByEmail } from "./store.js";

const LOCAL_DEMO_TOKEN = "local-demo-token";

export type ChatMessageInput = { role: "user" | "assistant"; content: string };

export type ChatLdUserPayload = {
  key: string;
  email?: string;
  name?: string;
  orgId?: string;
  membershipTier?: string;
};

export type ChatSupportBody = {
  messages: ChatMessageInput[];
  /** Required when using local demo token so the server can build LaunchDarkly context. */
  ldUser?: ChatLdUserPayload;
};

export type ChatSupportWelcomeBody = {
  ldUser?: ChatLdUserPayload;
};

let clientsPromise: Promise<{ ld: LDClient; ai: LDAIClient }> | null = null;

async function getLdClients(): Promise<{ ld: LDClient; ai: LDAIClient }> {
  if (!clientsPromise) {
    clientsPromise = (async () => {
      const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
      if (!sdkKey?.trim()) {
        throw new Error("LAUNCHDARKLY_SDK_KEY is not set");
      }
      const ld = init(sdkKey);
      await ld.waitForInitialization({ timeout: 25 });
      return { ld, ai: initAi(ld) };
    })();
  }
  return clientsPromise;
}

/**
 * AI Config key in LaunchDarkly (completion mode, OpenAI provider). Variations (e.g. “Booking Support” vs “Hostile Bot”)
 * are chosen only by LaunchDarkly targeting for this key — not in application code.
 */
function aiConfigKey(): string {
  const k = process.env.LAUNCHDARKLY_AI_CONFIG_KEY;
  if (typeof k === "string" && k.trim().length > 0) return k.trim();
  return "hospitality-chat";
}

/**
 * If LaunchDarkly cannot evaluate `hospitality-chat` (or your override key), we do not substitute a local prompt/model:
 * that would bypass AI Config variations. Chat returns an error until LD returns an enabled config.
 */
const AI_CONFIG_FALLBACK_DISABLED = { enabled: false as const };

/** OpenAI chat message content can be a string or (in newer APIs) structured parts. */
function normalizeAssistantText(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    const parts: string[] = [];
    for (const item of raw) {
      if (typeof item === "string") {
        parts.push(item);
        continue;
      }
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        if (typeof o.text === "string") parts.push(o.text);
        else if (o.type === "text" && typeof o.content === "string") parts.push(o.content);
      }
    }
    return parts.join("\n").trim();
  }
  return String(raw).trim();
}

/**
 * LaunchDarkly AI Config often uses camelCase; chat.completions expects snake_case for some fields.
 */
function openAiChatParamsFromLd(parameters: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!parameters) return {};
  const out: Record<string, unknown> = {};
  const copyNum = (keySnake: string, ...keys: string[]) => {
    for (const k of keys) {
      const v = parameters[k];
      if (typeof v === "number" && Number.isFinite(v)) {
        out[keySnake] = v;
        return;
      }
    }
  };
  copyNum("temperature", "temperature");
  copyNum("max_tokens", "max_tokens", "maxTokens");
  copyNum("top_p", "top_p", "topP");
  copyNum("frequency_penalty", "frequency_penalty", "frequencyPenalty");
  copyNum("presence_penalty", "presence_penalty", "presencePenalty");
  return out;
}

function ldContextFromUser(u: {
  id: string;
  email: string;
  name: string;
  orgId: string;
  membershipTier?: string;
}): LDContext {
  const ctx: Record<string, unknown> = {
    kind: "user",
    key: u.id,
    email: u.email,
    name: u.name,
    orgId: u.orgId,
  };
  if (u.membershipTier) ctx.membershipTier = u.membershipTier;
  return ctx as LDContext;
}

function resolveLdUser(
  bearer: string | undefined,
  body: Pick<ChatSupportBody, "ldUser">
): { ok: true; context: LDContext } | { ok: false; status: number; error: string } {
  if (!bearer) {
    return { ok: false, status: 401, error: "Authorization required" };
  }

  const userId = getUserIdForToken(bearer);
  if (userId) {
    const user = [...usersByEmail.values()].find((u) => u.id === userId);
    if (!user) {
      return { ok: false, status: 401, error: "Invalid session" };
    }
    return {
      ok: true,
      context: ldContextFromUser({
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId,
      }),
    };
  }

  if (bearer === LOCAL_DEMO_TOKEN) {
    const lu = body.ldUser;
    if (!lu?.key?.trim()) {
      return {
        ok: false,
        status: 400,
        error: "ldUser with key is required for demo sessions",
      };
    }
    return {
      ok: true,
      context: ldContextFromUser({
        id: lu.key,
        email: lu.email ?? "guest@demo.local",
        name: lu.name ?? "Guest",
        orgId: lu.orgId ?? "org-demo-1",
        membershipTier: lu.membershipTier,
      }),
    };
  }

  return { ok: false, status: 401, error: "Invalid session" };
}

/**
 * Assistant lines configured in the AI Config before the first "user" role message (e.g. welcome bubbles).
 * Skips system messages; concatenates consecutive assistant messages with a blank line.
 */
function assistantWelcomeFromConfigMessages(
  messages: { role: string; content: string }[] | undefined
): string {
  if (!messages?.length) return "";
  const parts: string[] = [];
  for (const m of messages) {
    if (m.role === "user") break;
    if (m.role === "assistant" && typeof m.content === "string") {
      const t = m.content.trim();
      if (t) parts.push(t);
    }
  }
  return parts.join("\n\n");
}

/**
 * Reads the evaluated AI Config from LaunchDarkly only (no OpenAI call) so the app can show the same
 * assistant welcome defined in each variation.
 */
export async function getChatSupportWelcome(
  bearer: string | undefined,
  body: ChatSupportWelcomeBody
): Promise<{ welcome: string } | { status: number; error: string }> {
  const auth = resolveLdUser(bearer, body);
  if (!auth.ok) {
    return { status: auth.status, error: auth.error };
  }

  let ai: LDAIClient;
  try {
    ({ ai } = await getLdClients());
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 503, error: `LaunchDarkly unavailable: ${msg}` };
  }

  const firstName = String(auth.context.name ?? "Guest").trim().split(/\s+/)[0] || "Guest";

  const config = await ai.completionConfig(
    aiConfigKey(),
    auth.context,
    AI_CONFIG_FALLBACK_DISABLED,
    { guestName: firstName }
  );

  if (!config.enabled) {
    return {
      status: 503,
      error:
        "AI Config not available from LaunchDarkly (check key, targeting, and that a variation is enabled for this user).",
    };
  }

  const welcome = assistantWelcomeFromConfigMessages(config.messages);
  return { welcome };
}

/**
 * Runs one chat turn: LaunchDarkly AI Config (completion) + OpenAI via TrackedChat.
 */
export async function runChatSupportTurn(
  bearer: string | undefined,
  body: ChatSupportBody
): Promise<{ reply: string } | { status: number; error: string }> {
  const msgs = body.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) {
    return { status: 400, error: "messages array required" };
  }

  const last = msgs[msgs.length - 1];
  if (!last || last.role !== "user" || typeof last.content !== "string" || !last.content.trim()) {
    return { status: 400, error: "Last message must be a non-empty user message" };
  }

  const prior = msgs.slice(0, -1);
  for (const m of prior) {
    if (m.role !== "user" && m.role !== "assistant") {
      return { status: 400, error: "Invalid role in history" };
    }
    if (typeof m.content !== "string") {
      return { status: 400, error: "Invalid message content" };
    }
  }

  const auth = resolveLdUser(bearer, body);
  if (!auth.ok) {
    return { status: auth.status, error: auth.error };
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { status: 503, error: "OPENAI_API_KEY is not configured on the server" };
  }

  let ai: LDAIClient;
  try {
    ({ ai } = await getLdClients());
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 503, error: `LaunchDarkly unavailable: ${msg}` };
  }

  const firstName = String(auth.context.name ?? "Guest").trim().split(/\s+/)[0] || "Guest";

  const chat = await ai.createChat(
    aiConfigKey(),
    auth.context,
    AI_CONFIG_FALLBACK_DISABLED,
    { guestName: firstName },
    "openai"
  );

  if (!chat) {
    return {
      status: 503,
      error:
        "AI Config not available from LaunchDarkly (check key matches your config, e.g. hospitality-chat, targeting, and that a variation is enabled for this user).",
    };
  }

  if (prior.length > 0) {
    chat.appendMessages(prior.map((m) => ({ role: m.role, content: m.content })));
  }

  const response = await chat.invoke(last.content.trim());
  let reply = normalizeAssistantText(response.message.content);

  if (!reply) {
    const cfg = chat.getConfig();
    const modelName = (cfg.model?.name ?? "").trim() || "gpt-4o-mini";
    let history = chat.getMessages(true).map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: normalizeAssistantText(m.content),
    }));
    const last = history[history.length - 1];
    if (last?.role === "assistant" && !last.content) {
      history = history.slice(0, -1);
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const extra = openAiChatParamsFromLd(cfg.model?.parameters as Record<string, unknown> | undefined);
      const raw = await client.chat.completions.create({
        model: modelName,
        messages: history,
        ...extra,
      });
      const choice = raw.choices?.[0];
      const msg = choice?.message;
      reply = normalizeAssistantText(msg?.content);
      if (!reply && msg && "tool_calls" in msg && Array.isArray((msg as { tool_calls?: unknown }).tool_calls)) {
        const tc = (msg as { tool_calls: unknown[] }).tool_calls;
        if (tc.length > 0) {
          return {
            status: 502,
            error:
              "The model returned tool calls instead of text. In your LaunchDarkly AI Config, use a text completion model without tools for this chat.",
          };
        }
      }
      if (!reply) {
        const fr = choice?.finish_reason ?? "unknown";
        return {
          status: 502,
          error: `Empty model response (finish_reason: ${fr}). Check the model id in your AI Config matches an OpenAI chat model (e.g. gpt-4o-mini).`,
        };
      }
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        status: 502,
        error: `OpenAI request failed: ${detail}`,
      };
    }
  }

  return { reply };
}
