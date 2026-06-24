/**
 * Seed synthetic engagement data for the `promo-banner-engagement` experiment
 * (flag: demo-promo-banner-variant) so the experiment shows results for demos.
 *
 * How it stays honest: it uses the real LaunchDarkly server SDK to evaluate the
 * flag for thousands of throwaway "user" contexts. Those contexts carry NO
 * membershipTier, so they miss the tier-targeting rules and hit the fallthrough —
 * which is the experiment's 4-way rollout. The SDK buckets each context into a
 * variation and emits an experiment-attributed exposure. We then emit conversion
 * events (track) at a per-variation rate, so attribution is real and the winner is designed.
 *
 * Usage (from repo root):
 *   node server/scripts/seed-experiment.mjs [userCount]   (or: npm run seed:experiment 6000)
 * Requires LAUNCHDARKLY_SDK_KEY (loaded from mobile/.env.local or server/.env.local).
 */
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { init } from "@launchdarkly/node-server-sdk";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
config({ path: resolve(repoRoot, "server/.env"), override: true });
config({ path: resolve(repoRoot, "mobile/.env"), override: true });
config({ path: resolve(repoRoot, "mobile/.env.local"), override: true });
config({ path: resolve(repoRoot, "server/.env.local"), override: true });

const FLAG = "demo-promo-banner-variant";
const EVT_CTA = "demo-promo-banner-variant-cta-click";
const EVT_BOOKING = "demo-promo-banner-booking-started";
const EVT_SIGNUP = "demo-promo-banner-rewards-signup";
const EVT_DWELL = "demo-promo-banner-dwell-ms";

/**
 * Designed per-variation behavior (per impression). Story: the Gold banner wins CTA
 * engagement; Platinum drives the most bookings; the Guest "create rewards account"
 * banner wins rewards signups. `standard` is the control/baseline.
 */
const PROFILE = {
  standard: { cta: 0.1, booking: 0.04, signup: 0.02, dwellMean: 1800 },
  platinum: { cta: 0.16, booking: 0.08, signup: 0.03, dwellMean: 2600 },
  gold: { cta: 0.21, booking: 0.06, signup: 0.025, dwellMean: 2450 },
  guest: { cta: 0.13, booking: 0.03, signup: 0.09, dwellMean: 2100 },
};

function dwellMs(mean) {
  const noise = (Math.random() - 0.5) * 0.7 * mean;
  return Math.max(400, Math.round(mean + noise));
}

const userCount = Math.max(1, Number(process.argv[2]) || 6000);
const runTag = Date.now().toString(36);

const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
if (!sdkKey?.trim()) {
  console.error("LAUNCHDARKLY_SDK_KEY is not set (add it to mobile/.env.local or server/.env.local).");
  process.exit(1);
}

const client = init(sdkKey);
const tally = {
  standard: { n: 0, cta: 0, booking: 0, signup: 0 },
  platinum: { n: 0, cta: 0, booking: 0, signup: 0 },
  gold: { n: 0, cta: 0, booking: 0, signup: 0 },
  guest: { n: 0, cta: 0, booking: 0, signup: 0 },
  other: 0,
};

await client.waitForInitialization({ timeout: 15 });
console.log(`LD ready. Seeding ${userCount} synthetic users (run ${runTag})…`);

for (let i = 0; i < userCount; i++) {
  // No membershipTier => misses tier rules => hits the experiment fallthrough rollout.
  const context = { kind: "user", key: `seed-${runTag}-${i}`, name: `Seed User ${i}`, anonymous: false };

  // Exposure: real, experiment-attributed evaluation.
  const variation = await client.variation(FLAG, context, "standard");
  const p = PROFILE[variation];
  if (!p) {
    tally.other++;
    continue;
  }
  tally[variation].n++;

  client.track(EVT_DWELL, context, undefined, dwellMs(p.dwellMean));
  if (Math.random() < p.cta) {
    client.track(EVT_CTA, context, { flagKey: FLAG, variation });
    tally[variation].cta++;
  }
  if (Math.random() < p.booking) {
    client.track(EVT_BOOKING, context, { flagKey: FLAG, variation });
    tally[variation].booking++;
  }
  if (Math.random() < p.signup) {
    client.track(EVT_SIGNUP, context, { flagKey: FLAG, variation });
    tally[variation].signup++;
  }

  if ((i + 1) % 1000 === 0) {
    await client.flush();
    console.log(`  …${i + 1}/${userCount}`);
  }
}

await client.flush();
await client.close();

console.log("\nDone. Allocation + conversions (synthetic):");
for (const v of ["standard", "platinum", "gold", "guest"]) {
  const t = tally[v];
  const pct = (x) => (t.n ? ((100 * x) / t.n).toFixed(1) + "%" : "—");
  console.log(
    `  ${v.padEnd(9)} n=${String(t.n).padStart(5)}  CTA ${pct(t.cta).padStart(6)}  booking ${pct(t.booking).padStart(6)}  signup ${pct(t.signup).padStart(6)}`
  );
}
if (tally.other) console.log(`  (unbucketed/other: ${tally.other})`);
console.log("\nEvents flushed to LaunchDarkly. Experiment results populate in a few minutes.");
