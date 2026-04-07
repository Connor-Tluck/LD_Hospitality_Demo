import type { AuthResponse, SessionUserPublic } from "@hospitality/shared";
import {
  DEMO_ORG_FOR_LOCAL,
  profileTraitsForSwitchUser,
  resolveDemoProfileByEmail,
} from "../data/demoContent";

/** Session marker stored in SecureStore alongside profile JSON. */
export const LOCAL_DEMO_TOKEN = "local-demo-token";

export const LOCAL_DEMO_PROFILE_KEY = "hospitality_local_demo_profile";

/**
 * When true (default), sign-in / sign-up never call the network; a session is stored on-device
 * so LaunchDarkly still receives user + org context. Set `EXPO_PUBLIC_LOCAL_DEMO_AUTH=false` to use the mock API.
 */
export function isLocalDemoAuthEnabled(): boolean {
  const v = process.env.EXPO_PUBLIC_LOCAL_DEMO_AUTH;
  if (v === "false" || v === "0") return false;
  return true;
}

/**
 * Builds a local-only session. If `email` matches a predefined switch-user profile, hospitality traits
 * (tier, spend, bookings, etc.) are merged so LaunchDarkly gets full user context — not anonymous.
 */
export function buildLocalDemoSession(input: { email: string; name?: string }): AuthResponse {
  const email = input.email.trim().toLowerCase();
  const profile = resolveDemoProfileByEmail(email);
  const displayName = profile?.name ?? input.name?.trim() ?? email.split("@")[0] ?? "Guest";
  const org = { ...DEMO_ORG_FOR_LOCAL };
  const user: SessionUserPublic = {
    id: `local-${email.replace(/[^a-z0-9]/gi, "-")}`,
    email,
    name: displayName,
    role: "member",
    orgId: org.id,
    ...(profile ? profileTraitsForSwitchUser(profile) : {}),
  };
  return {
    token: LOCAL_DEMO_TOKEN,
    user,
    org,
  };
}
