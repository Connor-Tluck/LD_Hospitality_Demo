/** Organization returned to clients and used in LaunchDarkly org context. */
export type Org = {
  id: string;
  name: string;
  plan: string;
  /** Portfolio size for hospitality targeting (optional). */
  propertyCount?: number;
  /** Primary operating region label, e.g. "North America". */
  primaryRegion?: string;
};

/** User record (server shape). */
export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  orgId: string;
  role: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  name: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

/** Client-visible user (no secrets). Optional fields are for app / LaunchDarkly context. */
export type SessionUserPublic = {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  /** Server-provided permission strings; merged with client-derived rules for LaunchDarkly. */
  permissions?: string[];
  /** ISO 8601 — account creation time for loyalty / tenure targeting. */
  accountCreatedAt?: string;
  /** City, region (non-precise home market for hospitality). */
  homeLocation?: string;
  /** ISO 3166-1 alpha-2 country. */
  countryCode?: string;
  /** Loyalty tier label, e.g. PLATINUM, GOLD. */
  membershipTier?: string;
  /** Lifetime hotel & resort spend in USD (sensitive; often marked private in LaunchDarkly). */
  totalLifetimeSpendUsd?: number;
  /** Current rewards balance. */
  rewardPoints?: number;
  /** Confirmed upcoming stays (reservations). */
  upcomingBookingsCount?: number;
  /** Whether the user has at least one upcoming stay. */
  hasUpcomingStays?: boolean;
  /** Beta program / early access participant. */
  isBetaUser?: boolean;
};

export type AuthResponse = {
  token: string;
  user: SessionUserPublic;
  org: Org;
};

export type MeResponse = {
  user: SessionUserPublic;
  org: Org;
};
