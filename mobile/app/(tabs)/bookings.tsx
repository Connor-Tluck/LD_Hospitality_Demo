import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LD_FLAG_BOOKINGS_CALENDAR } from "../../src/lib/ld/flags";
import { colors, fontFamily, radii } from "../../src/theme/tokens";

const TAB_BAR_SPACE = 120;

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const calendarDemoEnabled = useBoolVariation(LD_FLAG_BOOKINGS_CALENDAR, false);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: TAB_BAR_SPACE + insets.bottom }]}>
      <StatusBar style="dark" />
      <View style={styles.inner}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.sub}>
          Upcoming stays and reservations. When the LaunchDarkly flag is on, you can open the new trip calendar demo
          (it intentionally fails and sends telemetry to Observability).
        </Text>

        {calendarDemoEnabled ? (
          <Pressable
            onPress={() => router.push("/bookings/calendar")}
            style={({ pressed }) => [styles.calendarCard, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open trip calendar"
          >
            <View style={styles.calendarIconWrap}>
              <Ionicons name="calendar" size={26} color={colors.accentPrimary} />
            </View>
            <View style={styles.calendarCopy}>
              <Text style={styles.calendarEyebrow}>New · LaunchDarkly demo</Text>
              <Text style={styles.calendarTitle}>Trip calendar</Text>
              <Text style={styles.calendarBody}>
                Preview the redesigned calendar. Tap to load — the demo reports an error to LaunchDarkly Observability
                for metrics and debugging.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.foregroundMuted} />
          </Pressable>
        ) : null}

        <View style={[styles.card, calendarDemoEnabled && styles.cardBelow]}>
          <Text style={styles.cardTitle}>No upcoming trips</Text>
          <Text style={styles.cardBody}>Explore Featured Hotels on the Home tab to plan your next stay.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 26,
    color: colors.foregroundPrimary,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.foregroundSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  calendarCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    marginBottom: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
  calendarIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(125, 107, 61, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCopy: { flex: 1, minWidth: 0 },
  calendarEyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  calendarTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 17,
    color: colors.foregroundPrimary,
    marginBottom: 4,
  },
  calendarBody: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.foregroundSecondary,
  },
  pressed: { opacity: 0.9 },
  card: {
    padding: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardBelow: {
    marginTop: 0,
  },
  cardTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.foregroundPrimary,
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundMuted,
    lineHeight: 20,
  },
});
