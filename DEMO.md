# Demo runbook — Promo banner: targeting + experimentation

A single LaunchDarkly flag both **controls** the guest experience (tier targeting) and
lets you **measure** it (an A/B/C/D experiment). This is the core "control + measure on
one flag" story.

- **Flag:** `demo-promo-banner-variant` (multivariate string, 4 variations)
- **Experiment:** `promo-banner-engagement` (running, env `production`)
- **Primary metric:** `demo-promo-banner-variant-cta-click` (banner CTA click-through)

---

## The narrative

### 1. Hook — "We control the guest experience with one flag."
Our app shows a promo banner at the top of the home screen. A single flag,
`demo-promo-banner-variant`, decides which of four banner designs each guest sees — and we
target it by membership tier: Platinum guests get a luxe concierge banner, Gold get a points
offer, Guests get a "create rewards account" prompt.

> **Do it live:** use **Switch User** to move between personas — the banner restyles per tier.

### 2. Question — "But which banner actually works best?"
Targeting lets us tailor the experience; it doesn't tell us what *performs*. So on the **same
flag** we ran an experiment: randomly serve one of the four banners to new traffic and measure
engagement. No code change, no redeploy — the experiment runs on the flag's **fallthrough**,
while the tier rules keep serving personalized banners to known guests.

### 3. Result — primary metric (CTA click-through)
Clear winner: the **Gold "double points" banner drove ~20% click-through vs. ~9% for the
control** — more than double, statistically significant.

| Banner | CTA (primary) |
|--------|:---:|
| Standard (control) | ~9% |
| Guest | ~12% |
| Platinum | ~17% |
| **Gold** | **~20%** ✅ |

### 4. Nuance — secondary metrics tell a richer story
CTA isn't the whole picture:
- **Platinum** drove the most **bookings**.
- The **Guest** banner converted the most **rewards signups** (~5× the control).

So "best" depends on the goal — exactly the conversation experimentation is meant to surface.

### 5. Payoff — "Measure, then decide, instantly."
Make a data-backed call: roll **Gold** out to everyone for raw engagement — *or*, because we
already target by tier, keep personalizing (Gold for the masses, the rewards banner for
unenrolled guests where it converts best). Either way it's a flag change, live in seconds,
with a kill-switch if metrics dip.

### One-line takeaway
> **One flag both *controls* the experience (tier targeting) and *measures* it (experiment) —
> so you ship personalization and prove its impact without touching code.**

---

## How it's wired

### Targeting (controls the experience)
Rules on `demo-promo-banner-variant` (context kind `user`, attribute `membershipTier`):

| Tier | Banner variation |
|------|------------------|
| `PLATINUM` | `platinum` (luxe dark) |
| `GOLD` | `gold` (gold gradient) |
| `SILVER` | `standard` (light welcome) |
| `GUEST` | `guest` (green "create rewards account") |
| *fallthrough* | 4-way experiment rollout (25% each) |
| *off / default* | `none` — **no banner** (kill-switch; also the default when the flag is off or after the experiment ends) |

The app renders nothing for `none` and the Home screen reclaims the top safe-area space, so
turning the flag off cleanly hides the banner with no layout gap.

App rendering: [`mobile/src/components/PromoBannerVariant.tsx`](mobile/src/components/PromoBannerVariant.tsx).

### Experiment (measures the experience)
- 4 treatments at 25% each (Standard = baseline/control), attached to the **fallthrough**.
- **Metrics** (event keys fired by the app + seed):
  - `demo-promo-banner-variant-cta-click` — CTA click-through **(primary)**
  - `demo-promo-banner-booking-started` — booking started
  - `demo-promo-banner-rewards-signup` — rewards account created
  - `demo-promo-banner-dwell-ms` — banner dwell time, numeric
- Because known tiers match a rule, **live demo users don't enter the experiment** — the
  experiment population comes from the seed (untiered traffic that hits the fallthrough). This
  keeps the targeting demo and the experiment cleanly separate.

---

## Run the demo

### Personas (local demo auth — must match a profile to get a tier)
Sign in with these emails, or use the in-app **Switch User** flow:

| Persona | Email | Banner |
|---------|-------|--------|
| Alexandra Chen | `alexandra.chen@demo.local` | platinum (dark/gold) |
| James Morrison | `james.morrison@demo.local` | gold |
| Guest User | `guest@caesars.com` | guest (green signup) |
| Sofia Rodriguez | `sofia.rodriguez@demo.local` | standard (SILVER) |

> Arbitrary emails have **no tier** → always show the generic `standard` banner.
> For visual contrast demo **Alexandra → James → Guest**.

### Start the app
```bash
npm run dev:ios     # API server + Expo on the iOS simulator
```

### Seed / refresh experiment results
```bash
npm run seed:experiment 6000   # synthetic, experiment-attributed exposures + conversions
```
Results render in LaunchDarkly → **Experiments → Promo Banner Engagement** within a few minutes.
Re-run with a larger number to tighten confidence intervals.

> The seed uses the real LaunchDarkly server SDK ([`server/scripts/seed-experiment.mjs`](server/scripts/seed-experiment.mjs)):
> untiered contexts hit the experiment fallthrough, get bucketed by the SDK, and emit real
> in-experiment exposures + conversion events at designed per-variation rates.

---

# Observability — error logging, stack traces, and Vega

A second flag, **`demo-bookings-calendar`**, gates a "Trip calendar" entry on the Bookings tab.
Opening it intentionally fails and reports the error to **LaunchDarkly Observability** — errors,
logs, a trace/span, and a metric — so you can demo error monitoring and AI debugging (Vega).

- Screen: [`mobile/app/bookings/calendar.tsx`](mobile/app/bookings/calendar.tsx)
- Observability wired in [`mobile/src/lib/ld/client.ts`](mobile/src/lib/ld/client.ts) (`serviceVersion` = `app.json` → `expo.version`)

### What the error carries
- A typed **`CalendarServiceError`** with a clean message ("Calendar service returned 503 while
  fetching trip dates") — flag/session context travels as **attributes** (`ld.flag.value`,
  `observability.session.id`, `demo.intentional`…), not stuffed into the message. This makes the
  error title and the Vega reference readable, and gives Vega structured fields to reason over.
- A **multi-frame stack** — the failure is thrown through a named call chain
  (`parseCalendarResponse ← fetchTripDates ← loadTripCalendar`) so the trace has real frames.

### Stack traces: Expo Go vs. release build
| Running in | Stack trace quality |
|---|---|
| **Expo Go (dev)** | Named frames show, but locations are Metro bundle URLs — not file:line. Good for *talking through* error capture + Vega. |
| **Release build at the uploaded version** | Fully symbolicated `calendar.tsx:NN` frames. |

### Symbolicating: generate + upload source maps
Symbolication needs production source maps uploaded for the **matching app version**
(`serviceVersion` = `app.json` `expo.version`, currently `1.0.0`):

```bash
cd mobile
bash scripts/generate-ld-sourcemaps.sh    # builds prod bundles + .js.map into .ld-sourcemaps/
# upload (uses LD_API_KEY from .env.local; the script prints this command):
set -a && source .env.local && set +a
ldcli sourcemaps upload --access-token "$LD_API_KEY" \
  --project "CT-Job-Tracker-Demo" --app-version "1.0.0" --path "$(pwd)/.ld-sourcemaps"
```

Two things must line up for symbolicated stacks to appear:
1. **`--app-version` == `serviceVersion`** (both `1.0.0` today). Bump `expo.version` → regenerate + re-upload with the new version.
2. The app generating the error must be the **release build** of that version (EAS build or
   `npx expo run:ios --configuration Release`) — **not Expo Go**, whose dev bundle won't match the maps.

> `.ld-sourcemaps/` is gitignored (build artifacts).

### Backend observability (service `hospitality-server`)
The Hono API is instrumented with `@launchdarkly/observability-node` ([`server/src/observability.ts`](server/src/observability.ts)),
wired in [`server/src/index.ts`](server/src/index.ts). One LD client serves both flags and observability;
the chat path reuses it, so AI calls correlate with request traces.

Each request produces a **SERVER span** (its duration = request latency) plus metrics. Telemetry lands
under a **separate service from the mobile app**:

| Service | Source | Build cards on |
|---------|--------|----------------|
| `hospitality-mobile` | Expo app | errors (`CalendarServiceError`), span `demo.bookings_calendar.load`, metric `demo.bookings_calendar.load_failed` |
| `hospitality-server` | Hono API | request spans `GET /health`, `POST /ai/chat-support`, … (attrs `http.request.method`, `http.route`, `http.response.status_code`); metrics `http.server.request.duration`, `http.server.request.count` |

This is what fills the **request / duration / throughput / latency** dashboard cards — select service
`hospitality-server` and a recent time window. It also enables a **mobile → API → LLM** trace.

> **Dashboard "no data" gotchas:** the prebuilt *Frontend* template is web-oriented — its request/duration
> cards expect signals RN doesn't emit. Build cards against the services/signals above instead. Also widen
> the time range (telemetry only exists when the app/API are exercised) and confirm you're in `production`.
