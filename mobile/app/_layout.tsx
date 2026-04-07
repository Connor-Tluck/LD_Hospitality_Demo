import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from "@expo-google-fonts/geist";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { LDIdentifyBridge } from "../src/context/LDIdentifyBridge";
import { getLDClient, LDProvider } from "../src/lib/ld/client";
import { colors } from "../src/theme/tokens";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const ldClient = getLDClient();

  return (
    <SafeAreaProvider>
      <LDProvider client={ldClient}>
        <AuthProvider>
          <LDIdentifyBridge />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.surfacePrimary },
            }}
          >
            <Stack.Screen name="switch-user" options={{ presentation: "modal" }} />
          </Stack>
        </AuthProvider>
      </LDProvider>
    </SafeAreaProvider>
  );
}
