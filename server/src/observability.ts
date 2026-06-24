import { init, type LDClient } from "@launchdarkly/node-server-sdk";
import { initAi, type LDAIClient } from "@launchdarkly/server-sdk-ai";
import { Observability } from "@launchdarkly/observability-node";

/** Service identity in LaunchDarkly Observability (distinct from the mobile `hospitality-mobile`). */
export const SERVER_SERVICE_NAME = "hospitality-server";
export const SERVER_SERVICE_VERSION = "1.0.0";

let clientsPromise: Promise<{ ld: LDClient; ai: LDAIClient }> | null = null;

/**
 * Single LaunchDarkly server client for the whole process, with the Observability plugin.
 * Registering the plugin sets up the global OpenTelemetry provider/exporter, so manual spans
 * (request middleware) and `LDObserve` metrics/logs/errors all export to LaunchDarkly.
 * Shared by the AI chat path so AI calls correlate with request traces.
 */
export function getLdClients(): Promise<{ ld: LDClient; ai: LDAIClient }> {
  if (!clientsPromise) {
    clientsPromise = (async () => {
      const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
      if (!sdkKey?.trim()) {
        throw new Error("LAUNCHDARKLY_SDK_KEY is not set");
      }
      const ld = init(sdkKey, {
        plugins: [
          new Observability({
            serviceName: SERVER_SERVICE_NAME,
            serviceVersion: SERVER_SERVICE_VERSION,
          }),
        ],
      });
      await ld.waitForInitialization({ timeout: 25 });
      return { ld, ai: initAi(ld) };
    })();
  }
  return clientsPromise;
}

/**
 * Kick off client + Observability initialization at startup so the OpenTelemetry provider is
 * registered before requests arrive (otherwise early request spans use a no-op tracer).
 * No-op (with a warning) when the SDK key is missing, so the server still boots.
 */
export function initObservability(): void {
  if (!process.env.LAUNCHDARKLY_SDK_KEY?.trim()) {
    console.warn("[observability] LAUNCHDARKLY_SDK_KEY not set — server observability disabled");
    return;
  }
  void getLdClients().catch((e) =>
    console.warn("[observability] init failed:", e instanceof Error ? e.message : e)
  );
}
