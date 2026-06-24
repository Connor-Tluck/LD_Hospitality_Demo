import type { AuthResponse, LoginBody, MeResponse, RegisterBody, SessionUserPublic } from "@hospitality/shared";
import { getApiBaseUrl } from "./config";
import { isLocalDemoAuthEnabled, LOCAL_DEMO_TOKEN } from "./localDemoAuth";

/**
 * The booking assistant calls the **local Hono API** (`/ai/chat-support`), which then talks to LaunchDarkly AI Configs.
 * A raw "Network request failed" means the phone could not open a TCP connection — usually the API is not running,
 * the URL is wrong (e.g. 127.0.0.1 on a physical device), or Android is blocking cleartext HTTP.
 */
async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    return await fetch(url, init);
  } catch (e) {
    const orig = e instanceof Error ? e.message : String(e);
    throw new Error(
      `${orig}\n\n` +
        `Could not reach the mock API at ${base}. Run \`npm run dev:server\` from the repo root. ` +
        `On a physical device, set EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8787 in mobile/.env.local and restart Expo.`
    );
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function registerUser(body: RegisterBody): Promise<AuthResponse> {
  const res = await fetchApi("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Register failed (${res.status})`);
  }
  return parseJson<AuthResponse>(res);
}

export async function loginUser(body: LoginBody): Promise<AuthResponse> {
  const res = await fetchApi("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Login failed (${res.status})`);
  }
  return parseJson<AuthResponse>(res);
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetchApi("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Session invalid (${res.status})`);
  }
  return parseJson<MeResponse>(res);
}

export type ChatSupportTurn = { role: "user" | "assistant"; content: string };

export async function postChatSupport(
  token: string,
  user: SessionUserPublic,
  messages: ChatSupportTurn[]
): Promise<{ reply: string }> {
  const body: {
    messages: ChatSupportTurn[];
    ldUser?: Record<string, unknown>;
  } = { messages };

  if (isLocalDemoAuthEnabled() && token === LOCAL_DEMO_TOKEN) {
    body.ldUser = {
      key: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      ...(user.membershipTier != null ? { membershipTier: user.membershipTier } : {}),
      ...(user.homeLocation != null ? { homeLocation: user.homeLocation } : {}),
      ...(user.countryCode != null ? { region: user.countryCode } : {}),
    };
  }

  const res = await fetchApi("/ai/chat-support", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Chat failed (${res.status})`);
  }
  return parseJson<{ reply: string }>(res);
}

export async function fetchChatWelcome(token: string, user: SessionUserPublic): Promise<{ welcome: string }> {
  const body: { ldUser?: Record<string, unknown> } = {};

  if (isLocalDemoAuthEnabled() && token === LOCAL_DEMO_TOKEN) {
    body.ldUser = {
      key: user.id,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      ...(user.membershipTier != null ? { membershipTier: user.membershipTier } : {}),
      ...(user.homeLocation != null ? { homeLocation: user.homeLocation } : {}),
      ...(user.countryCode != null ? { region: user.countryCode } : {}),
    };
  }

  const res = await fetchApi("/ai/chat-support/welcome", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Welcome failed (${res.status})`);
  }
  return parseJson<{ welcome: string }>(res);
}
