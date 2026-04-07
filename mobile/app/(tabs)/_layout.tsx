import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { colors, fontFamily } from "../../src/theme/tokens";

export default function TabLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();
  /** `<Redirect href="/" />` re-fired navigation each render → max update depth. One-shot replace in an effect instead. */
  const didKickToWelcomeRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      didKickToWelcomeRef.current = false;
      return;
    }
    if (didKickToWelcomeRef.current) return;
    didKickToWelcomeRef.current = true;
    router.replace("/");
  }, [loading, user, router]);

  if (loading) {
    return null;
  }
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 12),
          height: 58 + Math.max(insets.bottom - 8, 0),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom - 4, 4),
          borderRadius: 36,
          backgroundColor: colors.surfaceCard,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.semibold,
          fontSize: 9,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "EXPLORE",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "compass" : "compass-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "BOOKINGS",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "PROFILE",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
