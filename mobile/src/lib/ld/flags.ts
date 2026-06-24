/**
 * LaunchDarkly flag keys — create matching boolean flags in your LD project (same environment as the mobile key).
 */
export const LD_FLAG_DEMO_HOME_PROMO = "demo-home-feature";

/**
 * Custom event for experiments / metrics: fire on Home “Elevate Rewards” banner CTA tap.
 * In LaunchDarkly: Metrics → create metric from custom events → use this exact event key.
 */
export const LD_EVENT_DEMO_HOME_PROMO_CTA_CLICK = "demo-home-feature-promo-cta-click";

/**
 * Numeric metric (milliseconds): time from promo mount until the main thread is idle after transitions.
 * Use `track(..., data, metricValue)` — in LaunchDarkly create a **numeric** metric from this event key, then attach it to a **guarded rollout** as a **lower-is-better** latency metric.
 */
export const LD_EVENT_DEMO_HOME_PROMO_INTERACTIVE_LATENCY_MS = "demo-home-feature-promo-interactive-latency-ms";

/**
 * Fires when the promo path hits an unexpected error (rare). Create a **frequency** or **error-rate** style metric in LaunchDarkly from this event key for guarded rollouts.
 */
export const LD_EVENT_DEMO_HOME_PROMO_LOAD_ERROR = "demo-home-feature-promo-load-error";
export const LD_FLAG_BOOKINGS_CALENDAR = "demo-bookings-calendar";
/** Floating AI booking assistant (UI). Create a boolean flag with this key in LaunchDarkly. */
export const LD_FLAG_CHAT_SUPPORT = "chat-support";

/**
 * Multivariate (string) flag: which top-of-screen promo banner variation to show.
 * Targeted by `user.membershipTier` in LaunchDarkly. Variation values:
 *   - "platinum" — luxe dark banner (targets PLATINUM)
 *   - "gold"     — gold gradient banner (targets GOLD)
 *   - "standard" — light welcome banner (targets SILVER, and the fallthrough/off default)
 *   - "guest"    — "create a rewards account" banner (targets GUEST)
 */
export const LD_FLAG_PROMO_BANNER_VARIANT = "demo-promo-banner-variant";

/** Allowed variation values for {@link LD_FLAG_PROMO_BANNER_VARIANT}. */
export type PromoBannerVariant = "platinum" | "gold" | "standard" | "guest";

/**
 * Conversion / engagement event keys for the `demo-promo-banner-variant` experiment.
 * Metrics in LaunchDarkly are created from these exact keys (see the `promo-banner-engagement` experiment).
 */
/** Primary metric: CTA tap on the promo banner. */
export const LD_EVENT_PROMO_BANNER_CTA_CLICK = "demo-promo-banner-variant-cta-click";
/** Secondary: a booking flow was started after seeing the banner. */
export const LD_EVENT_PROMO_BANNER_BOOKING_STARTED = "demo-promo-banner-booking-started";
/** Secondary: a rewards account was created (guest variant's goal). */
export const LD_EVENT_PROMO_BANNER_REWARDS_SIGNUP = "demo-promo-banner-rewards-signup";
/** Secondary (numeric, ms): how long the banner was on screen — an engagement signal. */
export const LD_EVENT_PROMO_BANNER_DWELL_MS = "demo-promo-banner-dwell-ms";
