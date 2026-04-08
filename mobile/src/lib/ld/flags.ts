/**
 * LaunchDarkly flag keys — create matching boolean flags in your LD project (same environment as the mobile key).
 */
export const LD_FLAG_DEMO_HOME_PROMO = "demo-home-feature";

/**
 * Custom event for experiments / metrics: fire on Home “Elevate Rewards” banner CTA tap.
 * In LaunchDarkly: Metrics → create metric from custom events → use this exact event key.
 */
export const LD_EVENT_DEMO_HOME_PROMO_CTA_CLICK = "demo-home-feature-promo-cta-click";
export const LD_FLAG_BOOKINGS_CALENDAR = "demo-bookings-calendar";
/** Floating AI booking assistant (UI). Create a boolean flag with this key in LaunchDarkly. */
export const LD_FLAG_CHAT_SUPPORT = "chat-support";
