import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from "@expo-google-fonts/geist";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ChatSupportOverlay } from "../src/components/ChatSupportOverlay";
import { AuthProvider } from "../src/context/AuthContext";
import { LDIdentifyBridge } from "../src/context/LDIdentifyBridge";
import { getLDClient, LDProvider } from "../src/lib/ld/client";
import { colors } from "../src/theme/tokens";

SplashScreen.preventAutoHideAsync();

/**
 * Mounts the flag-reading app (navigator + chat overlay) only after LaunchDarkly finishes its
 * first identify. This prevents flag hooks from evaluating before the client is initialized —
 * which otherwise logs "called before initialized" / "Unknown feature flag" warnings and flashes
 * default flag values. The splash stays up until then. `LDIdentifyBridge` runs throughout so the
 * identify it waits on actually happens.
 */
function AppContent() {
  const [ldReady, setLdReady] = useState(false);
  const handleLdReady = useCallback(() => setLdReady(true), []);

  // Safety net: never block the app on LaunchDarkly for more than a few seconds.
  useEffect(() => {
    const t = setTimeout(() => setLdReady(true), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ldReady) void SplashScreen.hideAsync();
  }, [ldReady]);

  return (
    <>
      <LDIdentifyBridge onReady={handleLdReady} />
      {ldReady ? (
        <>
          <ChatSupportOverlay />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.surfacePrimary },
            }}
          >
            <Stack.Screen name="switch-user" options={{ presentation: "modal" }} />
          </Stack>
        </>
      ) : null}
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  if (!loaded) {
    return null;
  }

  const ldClient = getLDClient();

  return (
    <SafeAreaProvider>
      <LDProvider client={ldClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LDProvider>
    </SafeAreaProvider>
  );
}
