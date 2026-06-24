# Hospitality — LaunchDarkly demo app

A small **hospitality-themed** mobile experience used to demonstrate **LaunchDarkly** feature flags, **multi-context targeting**, and **Observability** in a realistic client app. The project is a **monorepo**: Expo + React Native for the app, an optional Hono API, and shared TypeScript types.

## Tech stack

| Area | Technologies |
|------|----------------|
| **Mobile** | [Expo](https://expo.dev/) (SDK 54), **React Native**, **React 19**, **TypeScript**, [Expo Router](https://docs.expo.dev/router/introduction/) |
| **Feature flags & observability** | [LaunchDarkly React Native SDK](https://docs.launchdarkly.com/sdk/client-side/react/react-native), [LaunchDarkly Observability for React Native](https://docs.launchdarkly.com/home/observability) |
| **Backend (optional)** | Node.js, [Hono](https://hono.dev/), TypeScript, [`tsx`](https://github.com/privatenumber/tsx) |
| **Shared code** | `packages/shared` — types and shapes used by mobile and server |
| **Repo layout** | npm **workspaces** (`mobile`, `server`, `packages/shared`) |

Root scripts:

- **`npm run dev:ios`** — **recommended for demos:** starts the mock API **and** Expo, then opens the iOS simulator. Use this so the booking-assistant chat (which needs the API) works.
- `npm run dev` — starts the mock API **and** Expo; press `i` for iOS or scan the QR for a device.
- `npm run ios --workspace=mobile` — Expo only, opens the iOS simulator directly (`expo start --ios`) — no API, so chat won't work
- `npm run dev:mobile` — start the Expo app only (`mobile`), then press `i` — no API, so chat won't work
- `npm run dev:server` — start the mock API only (`server`, port `8787` by default)
- `npm run seed:experiment 6000` — seed synthetic, experiment-attributed events for the banner experiment (see [`DEMO.md`](DEMO.md))
- `npm run build:web-demo` — static **web** export to `mobile/web-build` plus `demo.html` (Web vs **simulated iPhone** switcher in the browser)
- `npm run preview:web-demo` — serve `mobile/web-build` on port **3333**; open **`http://localhost:3333/demo.html`** (use HTTP — not `file://`, or asset paths break)

Once Metro is running, in the Expo CLI: **`i`** = iOS simulator, **`r`** = reload, **`j`** = debugger. For the full demo walkthrough see [`DEMO.md`](DEMO.md).

## UI screenshots

Screens from the app live in [`mobile/src/images/`](mobile/src/images/).

| | |
|:--|:--|
| ![App UI 1](mobile/src/images/image%20(1).png) | ![App UI 2](mobile/src/images/image%20(2).png) |
| ![App UI 3](mobile/src/images/image%20(3).png) | ![App UI 4](mobile/src/images/image%20(4).png) |

## What this demo is for

The app is intentionally **thin on “real” backend logic** so you can focus on **flag-driven UX**, **rich evaluation context**, and **telemetry**. Below is what the codebase is set up to showcase when paired with a LaunchDarkly project.

### Demo users and local auth

- **Default path (`EXPO_PUBLIC_LOCAL_DEMO_AUTH=true`)**: sign-in does **not** call your server. Any non-empty email and password creates an on-device session so **LaunchDarkly still receives identifiable user + organization context** after login.
- **Predefined “switch user” profiles**: if the email matches a demo profile, the app merges **hospitality traits** (tier, lifetime spend, reward points, bookings, beta flag, location, etc.) into the session — useful for **rules-based targeting** in LaunchDarkly instead of anonymous traffic.

Example emails (see [`mobile/src/data/demoContent.ts`](mobile/src/data/demoContent.ts) for the full list):

| Profile | Email (local demo) |
|---------|-------------------|
| Platinum guest | `alexandra.chen@demo.local` |
| Gold / beta | `james.morrison@demo.local` |
| Silver / new | `sofia.rodriguez@demo.local` |
| Guest | `guest@caesars.com` |

Use the in-app **Switch user** flow to pick a persona quickly; traits flow into **multi-context** identify (user, organization, device) via [`LDIdentifyBridge`](mobile/src/context/LDIdentifyBridge.tsx) and [`buildLaunchDarklyContext`](mobile/src/lib/ld/buildContext.ts).

### Feature flags used in the UI

Create **boolean** flags in the **same LaunchDarkly environment** as your mobile SDK key. Keys are defined in [`mobile/src/lib/ld/flags.ts`](mobile/src/lib/ld/flags.ts):

| Flag key | When ON | Purpose in the demo |
|----------|---------|----------------------|
| `demo-home-feature` | **Home** shows the “Elevate Rewards” promo banner and gradient treatment | Safe, visible **UI toggle** for stakeholders |
| `demo-bookings-calendar` | **Bookings** shows the “Trip calendar” entry → navigates to [`/bookings/calendar`](mobile/app/bookings/calendar.tsx) | **Observability** path: intentional failure + spans/attributes so you can inspect errors, logs, and metrics (and session correlation when enabled in your LD project) |
| `chat-support` | Floating **booking assistant** chat | The app calls the **local Hono API** only; the server uses **LaunchDarkly AI Configs** + OpenAI — see [Booking assistant](#booking-assistant-launchdarkly-ai-config). |

**Custom events for `demo-home-feature` (for metrics & guarded rollouts)** — keys are defined in [`mobile/src/lib/ld/flags.ts`](mobile/src/lib/ld/flags.ts); latency and errors are emitted from [`mobile/src/lib/ld/homePromoMetrics.ts`](mobile/src/lib/ld/homePromoMetrics.ts) and the Home tab.

| Event key | What it measures |
|-----------|------------------|
| `demo-home-feature-promo-interactive-latency-ms` | **Numeric (ms)** — time from promo mount until after `InteractionManager.runAfterInteractions` (proxy for “time to interactive”). Use as a **lower-is-better** metric in LaunchDarkly. |
| `demo-home-feature-promo-load-error` | **Errors** on the promo path (only if something throws during that measurement). Use as a **frequency** / error-rate style metric. |
| `demo-home-feature-promo-cta-click` | CTA taps (“See benefits”). |

**Why you do not see metrics in the UI yet:** LaunchDarkly does not invent these charts until you **create metrics** from incoming events. After you run the app with the flag on, open **Metrics** → **View incoming events** (or Live events, depending on your UI) to confirm the event keys, then [create metrics from custom events](https://docs.launchdarkly.com/home/metrics/create-metrics). Attach those metrics when you [start a guarded rollout](https://docs.launchdarkly.com/home/releases/guarded-rollouts) on `demo-home-feature` (Guardian plan or trial). The SDK sends latency via `track(eventKey, data, metricValue)` so the numeric value is available to LaunchDarkly.

### Targeted release (who sees a flag)

Evaluation uses **multi-context** (user, organization, device) with hospitality-oriented attributes. In the LaunchDarkly UI you can target by:

- **User** traits (e.g. membership tier, beta user, spend, tenure)
- **Organization** (demo org id/plan/region)
- **Device** / session hints wired in code

That supports **segmented releases** — e.g. beta users only, specific orgs, or high-value guests — without separate app builds.

### Rollback and “guarded” rollouts

The demo does not implement its own rollout engine; **LaunchDarkly does**. Typical patterns this app is meant to pair with:

- **Instant rollback**: turn a boolean flag **off** (or move everyone to the “off” variation) to revert UI immediately — no app store release required.
- **Guarded rollout** (metrics-driven): after **creating metrics** from the custom events above, attach **latency** and **error** metrics to a guarded rollout so LaunchDarkly can pause or auto-rollback if error rate rises or latency regresses versus the baseline variation. This requires the [Guardian / guarded rollouts](https://docs.launchdarkly.com/home/releases/guarded-rollouts) capability in your LaunchDarkly account.
- **Progressive / percentage rollouts**: use **percentage rollouts**, **targeting rules**, or **scheduled changes** in LaunchDarkly to limit blast radius without attaching metrics.
- **Kill switch**: the same flags act as a **kill switch** for the promo and calendar entry if something misbehaves in production.

### Observability

The calendar demo screen documents an **intentional error path** so **LaunchDarkly Observability** can receive correlated errors, logs, and traces. Configure Observability and (optionally) session replay in your **LaunchDarkly project**, not only in this repo. See comments in [`mobile/.env.example`](mobile/.env.example) and [`mobile/src/lib/ld/client.ts`](mobile/src/lib/ld/client.ts).

### Code references

Flag keys are aliased for **LaunchDarkly code references** (e.g. GitHub Action) in [`.launchdarkly/coderefs.yaml`](.launchdarkly/coderefs.yaml) so usage outside `flags.ts` is visible in the LD UI.

## Configuration

Copy [`mobile/.env.example`](mobile/.env.example) to `mobile/.env` and/or `mobile/.env.local`, set **`EXPO_PUBLIC_LAUNCHDARKLY_MOBILE_KEY`**, create the boolean flags you need from the table above, then restart Expo.

For optional beta targeting by email list, see `EXPO_PUBLIC_LD_BETA_EMAILS` in `.env.example`.

### Booking assistant (LaunchDarkly AI Config)

The mobile app **does not** call LaunchDarkly AI directly. It `fetch`es [`server`](server/) routes `/ai/chat-support` and `/ai/chat-support/welcome`. The server uses the **server-side SDK key** (`LAUNCHDARKLY_SDK_KEY`), your **AI Config** key (default `hospitality-chat`), and **`OPENAI_API_KEY`**. See [`server/.env.example`](server/.env.example) and [`server/src/chatSupport.ts`](server/src/chatSupport.ts).

If you see **“Network request failed”**, the device could not reach the mock API (wrong URL, server not running, or Android blocking plain HTTP). **Run `npm run dev:server`** from the repo root. On a **physical phone**, set `EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8787` in `mobile/.env.local` and restart Expo. Custom dev clients on Android use **cleartext HTTP** via `expo-build-properties` in [`mobile/app.json`](mobile/app.json); rebuild after changing it.

## Repository layout

```
mobile/           Expo + React Native app
server/           Optional Hono mock API (when local demo auth is off)
packages/shared/  Shared TypeScript types
```

---

This repository is for **demos and learning**; it is not a production hospitality platform.
