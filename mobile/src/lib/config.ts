import Constants from "expo-constants";

function extra(): Record<string, unknown> {
  return (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
}

const DEFAULT_API_PORT = "8787";

/**
 * In Expo Go, `hostUri` is usually your dev machine's LAN IP (physical device) or 127.0.0.1 (simulator).
 * Use that for the mock API so the phone can reach your Mac (not localhost on the device).
 */
function inferredApiHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (typeof hostUri !== "string" || hostUri.length === 0) return null;
  const host = hostUri.split(":")[0];
  if (!host) return null;
  return host;
}

/** Base URL for the mock API when `EXPO_PUBLIC_LOCAL_DEMO_AUTH=false`. */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv.replace(/\/$/, "");
  const e = extra()["apiUrl"];
  if (typeof e === "string" && e.length > 0) return e.replace(/\/$/, "");

  const port = process.env.EXPO_PUBLIC_API_PORT ?? DEFAULT_API_PORT;
  const host = inferredApiHost();
  if (host) return `http://${host}:${port}`;
  return `http://127.0.0.1:${port}`;
}

export function getLaunchDarklyMobileKey(): string {
  const k = process.env.EXPO_PUBLIC_LAUNCHDARKLY_MOBILE_KEY;
  if (typeof k === "string" && k.length > 0) return k;
  return "mob-placeholder-replace-in-env";
}
