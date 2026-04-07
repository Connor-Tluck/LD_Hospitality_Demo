import { useLDClient } from "@launchdarkly/react-native-client-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { buildLaunchDarklyContext } from "../lib/ld/buildContext";
import { getOrCreateDeviceInstallId } from "../lib/deviceId";

/**
 * Keeps LaunchDarkly context in sync with auth + stable device id (multi-kind: user, organization, device).
 * Context includes permissions/betaAccess, parsed name, locale/region/timezone on device, and org plan metadata.
 */
export function LDIdentifyBridge() {
  const client = useLDClient();
  const { user, org, loading } = useAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    void getOrCreateDeviceInstallId().then(setDeviceId);
  }, []);

  useEffect(() => {
    if (loading || !deviceId) return;

    void (async () => {
      const session =
        user && org
          ? {
              user,
              org,
            }
          : null;
      const ctx = await buildLaunchDarklyContext(deviceId, session);
      try {
        await client.identify(ctx);
      } catch (e) {
        console.warn("[LaunchDarkly] identify failed", e);
      }
    })();
  }, [client, loading, deviceId, user, org]);

  return null;
}
