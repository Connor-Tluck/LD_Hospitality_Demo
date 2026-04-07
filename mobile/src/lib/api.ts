import type { AuthResponse, LoginBody, MeResponse, RegisterBody } from "@hospitality/shared";
import { getApiBaseUrl } from "./config";

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
