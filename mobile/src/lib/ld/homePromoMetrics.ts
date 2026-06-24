import { LDObserve } from "@launchdarkly/observability-react-native";
import type { ReactNativeLDClient } from "@launchdarkly/react-native-client-sdk";
import {
  LD_EVENT_DEMO_HOME_PROMO_INTERACTIVE_LATENCY_MS,
  LD_EVENT_DEMO_HOME_PROMO_LOAD_ERROR,
  LD_FLAG_DEMO_HOME_PROMO,
} from "./flags";

const ATTR_FLAG = { "ld.flag.key": LD_FLAG_DEMO_HOME_PROMO, "demo.flow": "home-promo" };

/**
 * Sends latency as a custom event numeric (`metricValue`) so LaunchDarkly can build **numeric metrics**
 * for experiments and **guarded rollouts**. Also records a histogram for Observability.
 */
export function recordHomePromoInteractiveLatency(
  ldClient: ReactNativeLDClient,
  latencyMs: number
): void {
  ldClient.track(
    LD_EVENT_DEMO_HOME_PROMO_INTERACTIVE_LATENCY_MS,
    { ...ATTR_FLAG, unit: "ms" },
    latencyMs
  );

  if (LDObserve.isInitialized()) {
    LDObserve.recordHistogram({
      name: "demo.home_promo.interactive_latency_ms",
      value: latencyMs,
      attributes: ATTR_FLAG,
    });
    void LDObserve.flush();
  }
}

/** Client-side error on the Elevate Rewards promo path — pair with latency for error-rate style metrics in LD. */
export function recordHomePromoLoadError(ldClient: ReactNativeLDClient, err: Error): void {
  ldClient.track(LD_EVENT_DEMO_HOME_PROMO_LOAD_ERROR, {
    ...ATTR_FLAG,
    message: err.message,
  });

  if (LDObserve.isInitialized()) {
    LDObserve.recordError(err, ATTR_FLAG);
    LDObserve.recordIncr({
      name: "demo.home_promo.load_error",
      value: 1,
      attributes: ATTR_FLAG,
    });
    void LDObserve.flush();
  }
}
