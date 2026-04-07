import type { LDContext } from "@launchdarkly/react-native-client-sdk";
import {
  AutoEnvAttributes,
  LDProvider,
  ReactNativeLDClient,
} from "@launchdarkly/react-native-client-sdk";
import { Observability } from "@launchdarkly/observability-react-native";
import Constants from "expo-constants";
import { getLaunchDarklyMobileKey } from "../config";

let client: ReactNativeLDClient | null = null;

function observabilityOptions() {
  const version =
    typeof Constants.expoConfig?.version === "string" ? Constants.expoConfig.version : "1.0.0";

  return {
    serviceName: "hospitality-mobile",
    serviceVersion: version,
    /**
     * Names sessions in the Observability UI; pair with LD metrics/errors/traces for the same session.
     * Session replay (when enabled for your LD project) correlates via the same session pipeline.
     */
    contextFriendlyName: (ctx: LDContext): string | undefined => {
      const c = ctx as unknown as Record<string, unknown>;
      if (c.kind === "multi" && c.user && typeof c.user === "object" && c.user !== null) {
        const email = (c.user as { email?: string }).email;
        if (typeof email === "string" && email.length > 0) return email;
      }
      if (c.kind === "user") {
        if (typeof c.email === "string" && c.email.length > 0) return c.email;
        if (typeof c.key === "string") return c.key;
      }
      return undefined;
    },
  };
}

export function getLDClient(): ReactNativeLDClient {
  if (!client) {
    client = new ReactNativeLDClient(getLaunchDarklyMobileKey(), AutoEnvAttributes.Enabled, {
      plugins: [new Observability(observabilityOptions())],
    });
  }
  return client;
}

export { LDProvider };
