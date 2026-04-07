import type { LDContext } from "@launchdarkly/react-native-client-sdk";
import type { Org, SessionUserPublic } from "@hospitality/shared";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { getCalendars, getLocales } from "expo-localization";

/** Re-exported for auth; matches `SessionUserPublic` from shared. */
export type SessionUser = SessionUserPublic;

function parseDisplayName(name: string): { firstName: string; lastName: string | undefined } {
  const t = name.trim();
  if (!t) return { firstName: "unknown", lastName: undefined };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0]!, lastName: undefined };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

/**
 * Derives LaunchDarkly permission strings and beta access for targeting.
 * Merges server-provided `user.permissions` when present.
 */
export function derivePermissions(user: SessionUserPublic): { permissions: string[]; betaAccess: boolean } {
  const permissions: string[] = [];
  const role = user.role.toLowerCase();

  if (user.isBetaUser === true) permissions.push("beta");

  if (role === "admin" || role === "owner") permissions.push("admin");
  if (role === "beta" || role === "beta_tester") permissions.push("beta");

  const email = user.email.toLowerCase();
  const localPart = email.split("@")[0] ?? "";

  const envList = process.env.EXPO_PUBLIC_LD_BETA_EMAILS;
  if (typeof envList === "string" && envList.length > 0) {
    const allow = new Set(
      envList
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
    if (allow.has(email)) permissions.push("beta");
  }

  if (/(\+beta|beta\.|^beta\+)/i.test(localPart) || /\bbeta\b/i.test(localPart)) {
    permissions.push("beta");
  }

  for (const p of user.permissions ?? []) {
    const x = p.trim();
    if (x && !permissions.includes(x)) permissions.push(x);
  }

  const uniq = [...new Set(permissions)];
  return {
    permissions: uniq,
    betaAccess: uniq.includes("beta"),
  };
}

function localeAndRegion() {
  const locales = getLocales();
  const calendars = getCalendars();
  const loc = locales[0];
  const cal = calendars[0];
  return {
    languageTag: loc?.languageTag ?? "und",
    languageCode: loc?.languageCode ?? "und",
    regionCode: loc?.regionCode ?? null,
    currencyCode: loc?.currencyCode ?? null,
    measurementSystem: loc?.measurementSystem ?? null,
    timezone: cal?.timeZone ?? "unknown",
    uses24hourClock: cal?.uses24hourClock ?? null,
  };
}

function deviceAttributes(deviceInstallId: string) {
  const loc = localeAndRegion();
  const deviceType =
    Device.deviceType != null ? String(Device.deviceType) : Device.isDevice ? "handset" : "unknown";

  return {
    key: deviceInstallId,
    os: Device.osName ?? "unknown",
    osVersion: String(Device.osVersion ?? "unknown"),
    model: Device.modelName ?? "unknown",
    brand: Device.brand ?? "unknown",
    deviceType,
    isDevice: Device.isDevice,
    appVersion: Application.nativeApplicationVersion ?? "unknown",
    nativeBuild: Application.nativeBuildVersion ?? "unknown",
    appIdentifier: Application.applicationId ?? "unknown",
    expoAppVersion: Constants.expoConfig?.version ?? "unknown",
    expoRuntime: "expo" as const,
    appEnvironment: __DEV__ ? ("development" as const) : ("production" as const),
    locale: loc.languageTag,
    languageCode: loc.languageCode,
    region: loc.regionCode ?? "unknown",
    currencyCode: loc.currencyCode ?? "unknown",
    measurementSystem: loc.measurementSystem ?? "unknown",
    timezone: loc.timezone,
    uses24hourClock: loc.uses24hourClock ?? false,
  };
}

/** Not sent in full to LaunchDarkly analytics; still used in flag targeting. */
const LD_USER_PRIVATE_ATTRIBUTES = ["email", "totalLifetimeSpendUsd"] as const;

/**
 * User kind for LaunchDarkly multi-context. Includes hospitality traits and `_meta.privateAttributes`
 * for PII / sensitive commercial fields.
 */
function userContextForLaunchDarkly(user: SessionUserPublic): Record<string, unknown> {
  const { firstName, lastName } = parseDisplayName(user.name);
  const { permissions, betaAccess } = derivePermissions(user);

  const attrs: Record<string, unknown> = {
    key: user.id,
    email: user.email,
    name: user.name,
    firstName,
    role: user.role,
    orgId: user.orgId,
    permissions,
    betaAccess,
  };
  if (lastName !== undefined) attrs.lastName = lastName;

  const optional: (keyof SessionUserPublic)[] = [
    "accountCreatedAt",
    "homeLocation",
    "countryCode",
    "membershipTier",
    "totalLifetimeSpendUsd",
    "rewardPoints",
    "upcomingBookingsCount",
    "hasUpcomingStays",
    "isBetaUser",
  ];
  for (const k of optional) {
    const v = user[k];
    if (v !== undefined && v !== null) attrs[k as string] = v;
  }

  attrs._meta = {
    privateAttributes: [...LD_USER_PRIVATE_ATTRIBUTES],
  };

  return attrs;
}

function organizationAttributes(org: Org) {
  const attrs: Record<string, unknown> = {
    key: org.id,
    name: org.name,
    plan: org.plan,
    planKey: org.plan.trim().toLowerCase().replace(/\s+/g, "-"),
  };
  if (org.propertyCount != null) attrs.propertyCount = org.propertyCount;
  if (org.primaryRegion != null) attrs.primaryRegion = org.primaryRegion;
  return attrs;
}

export async function buildLaunchDarklyContext(
  deviceInstallId: string,
  session: { user: SessionUserPublic; org: Org } | null
): Promise<LDContext> {
  const device = deviceAttributes(deviceInstallId);

  /* Logged-out evaluation only — not used for local demo users while they have a session. */
  if (!session) {
    return {
      kind: "multi",
      user: { key: "anonymous", anonymous: true },
      organization: { key: "anonymous-org", anonymous: true },
      device: {
        ...device,
        sessionState: "anonymous" as const,
      },
    } as unknown as LDContext;
  }

  return {
    kind: "multi",
    user: userContextForLaunchDarkly(session.user),
    organization: organizationAttributes(session.org),
    device: {
      ...device,
      sessionState: "authenticated" as const,
      orgId: session.org.id,
    },
  } as unknown as LDContext;
}
