import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../src/context/AuthContext";
import { colors, fontFamily, radii } from "../src/theme/tokens";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading } = useAuth();
  /** Same as tabs layout: unstable `router` in deps re-fired replace and could hit max update depth. */
  const didNavigateToTabsRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      didNavigateToTabsRef.current = false;
      return;
    }
    if (didNavigateToTabsRef.current) return;
    didNavigateToTabsRef.current = true;
    router.replace("/(tabs)");
  }, [loading, user]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroContent, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.topLabel}>HOSPITALITY & GAMING</Text>
          <View style={styles.spacer} />
          <Text style={styles.brand}>CAESARS</Text>
          <Text style={styles.tagline}>Luxury Awaits</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Hotels · Dining · Entertainment · Experiences</Text>
          <View style={styles.flexSpacer} />
          <View style={styles.btnRow}>
            <Link href="/sign-in" asChild>
              <Pressable style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}>
                <Text style={styles.btnOutlineLabel}>SIGN IN</Text>
              </Pressable>
            </Link>
            <Link href="/sign-up" asChild>
              <Pressable style={({ pressed }) => [styles.btnSolid, pressed && styles.pressed]}>
                <Text style={styles.btnSolidLabel}>CREATE ACCOUNT</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceInverse },
  hero: { flex: 1, backgroundColor: colors.surfaceInverse },
  heroContent: { flex: 1, paddingHorizontal: 24, justifyContent: "flex-end" },
  topLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.6)",
  },
  spacer: { height: 240 },
  brand: {
    fontFamily: fontFamily.semibold,
    fontSize: 48,
    letterSpacing: 4,
    color: colors.foregroundInverse,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: 22,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: colors.accentLight,
    marginTop: 16,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.53)",
    marginTop: 12,
  },
  flexSpacer: { flex: 1 },
  btnRow: { gap: 12 },
  btnOutline: {
    height: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.foregroundInverse,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    letterSpacing: 1.5,
    color: colors.foregroundInverse,
  },
  btnSolid: {
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSolidLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    letterSpacing: 1.5,
    color: colors.foregroundInverse,
  },
  pressed: { opacity: 0.85 },
});
