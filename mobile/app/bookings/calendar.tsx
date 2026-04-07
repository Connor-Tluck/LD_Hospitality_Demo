import Ionicons from "@expo/vector-icons/Ionicons";
import { useLDClient } from "@launchdarkly/react-native-client-sdk";
import { LDObserve } from "@launchdarkly/observability-react-native";
import { SpanStatusCode } from "@opentelemetry/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LD_FLAG_BOOKINGS_CALENDAR } from "../../src/lib/ld/flags";
import { colors, fontFamily, radii } from "../../src/theme/tokens";

type Phase = "loading" | "error";

/**
 * Demo screen: intentional failure path so LaunchDarkly Observability receives
 * errors, logs, and metrics (and session correlation when replay is enabled in your LD project).
 */
export default function BookingsCalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ldClient = useLDClient();
  const [phase, setPhase] = useState<Phase>("loading");
  const recordedRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setPhase("error");
      if (recordedRef.current) return;
      recordedRef.current = true;

      const flagCalendarOn = ldClient.boolVariation(LD_FLAG_BOOKINGS_CALENDAR, false);

      const sessionId =
        LDObserve.isInitialized() === true
          ? String((LDObserve.getSessionInfo() as { sessionId?: string })?.sessionId ?? "")
          : "";

      /** Dev Metro bundles use virtual URLs — stacks won’t match production source maps; flag context lives here + attributes. */
      const attrs = {
        "demo.flow": "bookings-calendar",
        "ld.flag.key": LD_FLAG_BOOKINGS_CALENDAR,
        "ld.flag.value": flagCalendarOn ? "true" : "false",
        "demo.intentional": "true",
        "app.bundle": __DEV__ ? "development" : "production",
        ...(sessionId ? { "observability.session.id": sessionId } : {}),
      } as const;

      const err = new Error(
        `[${LD_FLAG_BOOKINGS_CALENDAR}=${flagCalendarOn ? "on" : "off"}] ` +
          (sessionId ? `[session=${sessionId}] ` : "") +
          (__DEV__ ? "[dev-bundle stacks are not source-mapped to prod uploads] " : "") +
          "Calendar service unavailable — demo error for LaunchDarkly Observability (bookings calendar)"
      );

      LDObserve.startActiveSpan("demo.bookings_calendar.load", (span) => {
        span.setAttributes({ ...attrs });
        LDObserve.recordError(err, { ...attrs });
        span.recordException(err);
        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      });

      LDObserve.recordLog(
        `Bookings calendar: load failed — flag ${LD_FLAG_BOOKINGS_CALENDAR}=${flagCalendarOn ? "true" : "false"}` +
          (sessionId ? ` session=${sessionId}` : ""),
        "error",
        {
          "demo.flow": "bookings-calendar",
          "ld.flag.key": LD_FLAG_BOOKINGS_CALENDAR,
          "ld.flag.value": flagCalendarOn ? "true" : "false",
          ...(sessionId ? { "observability.session.id": sessionId } : {}),
        }
      );

      LDObserve.recordIncr({
        name: "demo.bookings_calendar.load_failed",
        value: 1,
        attributes: {
          "demo.flow": "bookings-calendar",
        },
      });

      void LDObserve.flush();
    }, 700);

    return () => clearTimeout(id);
  }, [ldClient]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.accentPrimary} />
            <Text style={styles.backLabel}>Bookings</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Trip calendar</Text>
        <Text style={styles.sub}>
          New calendar experience (gated by flag{" "}
          <Text style={styles.mono}>{LD_FLAG_BOOKINGS_CALENDAR}</Text>).
        </Text>

        {phase === "loading" ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
            <Text style={styles.loadingText}>Loading your stays…</Text>
          </View>
        ) : (
          <View style={styles.errorCard} accessibilityRole="alert">
            <View style={styles.errorIconRow}>
              <Ionicons name="warning-outline" size={22} color="#B5564F" />
              <Text style={styles.errorTitle}>Couldn’t load calendar</Text>
            </View>
            <Text style={styles.errorBody}>
              Something went wrong while fetching your trip dates. This demo intentionally reports the failure to
              LaunchDarkly Observability so you can inspect errors, logs, traces, and (if enabled) session replay in
              the LD UI.
            </Text>
          </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 12,
  },
  backLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.accentPrimary,
    marginLeft: -4,
  },
  pressed: { opacity: 0.85 },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 26,
    color: colors.foregroundPrimary,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  mono: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.accentDark,
  },
  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.foregroundSecondary,
  },
  errorCard: {
    padding: 18,
    borderRadius: radii.lg,
    backgroundColor: "rgba(181, 86, 79, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(181, 86, 79, 0.35)",
  },
  errorIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  errorTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.foregroundPrimary,
  },
  errorBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.foregroundSecondary,
  },
});
