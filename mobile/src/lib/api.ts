import type { AuthResponse, LoginBody, MeResponse, RegisterBody, SessionUserPublic } from "@hospitality/shared";
import { getApiBaseUrl } from "./config";
import { isLocalDemoAuthEnabled, LOCAL_DEMO_TOKEN } from "./localDemoAuth";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function registerUser(body: RegisterBody): Promise<AuthResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
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
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
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
  const res = await fetch(`${getApiBaseUrl()}/me`, {
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
    };
  }

  const res = await fetch(`${getApiBaseUrl()}/ai/chat-support`, {
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
    };
  }

  const res = await fetch(`${getApiBaseUrl()}/ai/chat-support/welcome`, {
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
