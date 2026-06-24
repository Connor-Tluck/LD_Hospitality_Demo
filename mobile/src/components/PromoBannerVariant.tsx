import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLDClient, useStringVariation } from "@launchdarkly/react-native-client-sdk";
import {
  LD_EVENT_PROMO_BANNER_CTA_CLICK,
  LD_EVENT_PROMO_BANNER_DWELL_MS,
  LD_FLAG_PROMO_BANNER_VARIANT,
  type PromoBannerVariant,
} from "../lib/ld/flags";
import { colors, fontFamily, radii } from "../theme/tokens";

type VariantSpec = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  icon: string;
  /** Route pushed when the CTA is tapped. */
  route: string;
  /** Background gradient (top banner fill). */
  gradient: [string, string, ...string[]];
  /** Left accent rail color. */
  accent: string;
  /** Foreground text colors. */
  eyebrowColor: string;
  titleColor: string;
  bodyColor: string;
  /** CTA pill. */
  ctaBg: string;
  ctaText: string;
  /** Icon chip. */
  iconBg: string;
  iconBorder: string;
  iconColor: string;
};

/** Per-variation styling + copy. Each renders the same layout, distinctly themed. */
const VARIANTS: Record<PromoBannerVariant, VariantSpec> = {
  platinum: {
    eyebrow: "Platinum Concierge",
    title: "Your private suite upgrade awaits",
    body: "Complimentary suite upgrades, late checkout, and a dedicated concierge on your next stay.",
    cta: "Reserve",
    icon: "♛",
    route: "/promo/platinum",
    gradient: ["#1C1A17", "#2D2926", "#3A332B"],
    accent: colors.accentLight,
    eyebrowColor: colors.accentLight,
    titleColor: colors.foregroundInverse,
    bodyColor: "rgba(245,242,233,0.78)",
    ctaBg: colors.accentLight,
    ctaText: "#1C1A17",
    iconBg: "rgba(196,169,106,0.18)",
    iconBorder: "rgba(196,169,106,0.55)",
    iconColor: colors.accentLight,
  },
  gold: {
    eyebrow: "Gold Member Offer",
    title: "Double points this weekend",
    body: "Earn 2× reward points on stays and dining—exclusive to Gold members through Sunday.",
    cta: "Book now",
    icon: "★",
    route: "/promo/gold",
    gradient: ["#FBEFC9", "#F1D98B", "#E6C25E"],
    accent: colors.accentDark,
    eyebrowColor: colors.accentDark,
    titleColor: "#3A2E12",
    bodyColor: "#5A4D2E",
    ctaBg: colors.accentDark,
    ctaText: colors.foregroundInverse,
    iconBg: "rgba(90,77,46,0.12)",
    iconBorder: "rgba(90,77,46,0.4)",
    iconColor: colors.accentDark,
  },
  standard: {
    eyebrow: "Welcome",
    title: "Discover member rates",
    body: "Sign in to unlock member pricing on stays, dining, and experiences across our properties.",
    cta: "Explore",
    icon: "✦",
    route: "/promo/standard",
    gradient: ["#FFFDF7", "#F8F0DD", colors.surfacePrimary],
    accent: colors.accentPrimary,
    eyebrowColor: colors.accentPrimary,
    titleColor: colors.foregroundPrimary,
    bodyColor: colors.foregroundSecondary,
    ctaBg: colors.accentPrimary,
    ctaText: colors.foregroundInverse,
    iconBg: "rgba(125,107,61,0.12)",
    iconBorder: "rgba(196,169,106,0.45)",
    iconColor: colors.accentDark,
  },
  guest: {
    eyebrow: "Join Free",
    title: "Create your rewards account",
    body: "Sign up free to earn points, unlock member rates, and get exclusive offers on every stay.",
    cta: "Sign up",
    icon: "✚",
    route: "/promo/guest",
    gradient: ["#E8F0EA", "#D6E7DC", "#C5DCCD"],
    accent: colors.success,
    eyebrowColor: colors.success,
    titleColor: "#1F3A2A",
    bodyColor: "#3C5446",
    ctaBg: colors.success,
    ctaText: colors.foregroundInverse,
    iconBg: "rgba(74,124,89,0.14)",
    iconBorder: "rgba(74,124,89,0.45)",
    iconColor: colors.success,
  },
};

function isVariant(v: string): v is PromoBannerVariant {
  return v === "platinum" || v === "gold" || v === "standard" || v === "guest";
}

/**
 * Resolved banner variation, or `null` when no banner should show — i.e. the `none`
 * variation (default/off) or any unknown value. The Home screen uses this to decide
 * whether to reserve the safe-area space.
 */
export function usePromoBannerKey(): PromoBannerVariant | null {
  const variation = useStringVariation(LD_FLAG_PROMO_BANNER_VARIANT, "none");
  return isVariant(variation) ? variation : null;
}

/**
 * Top-of-screen promo banner driven by the multivariate flag {@link LD_FLAG_PROMO_BANNER_VARIANT}.
 * Renders one of three distinctly-styled banners based on the served variation
 * (targeted by `user.membershipTier` in LaunchDarkly).
 */
export function PromoBannerVariant() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ldClient = useLDClient();
  const key = usePromoBannerKey();

  // Engagement signal: record how long the banner stayed on screen (numeric metric).
  useEffect(() => {
    if (!key) return;
    const t0 = globalThis.performance.now();
    return () => {
      const ms = Math.round(globalThis.performance.now() - t0);
      ldClient.track(LD_EVENT_PROMO_BANNER_DWELL_MS, { flagKey: LD_FLAG_PROMO_BANNER_VARIANT, variation: key }, ms);
    };
  }, [ldClient, key]);

  // `none` (default/off) or unknown -> no banner.
  if (!key) return null;
  const spec = VARIANTS[key];

  return (
    <LinearGradient
      colors={spec.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.banner, { paddingTop: insets.top }]}
    >
      <View style={[styles.accent, { backgroundColor: spec.accent }]} />
      <View style={styles.inner}>
        <View style={styles.mainRow}>
          <View
            style={[styles.iconWrap, { backgroundColor: spec.iconBg, borderColor: spec.iconBorder }]}
          >
            <Text style={[styles.icon, { color: spec.iconColor }]} accessibilityLabel={spec.eyebrow}>
              {spec.icon}
            </Text>
          </View>
          <View style={styles.copy}>
            <Text style={[styles.eyebrow, { color: spec.eyebrowColor }]}>{spec.eyebrow}</Text>
            <Text style={[styles.title, { color: spec.titleColor }]} numberOfLines={2}>
              {spec.title}
            </Text>
            <Text style={[styles.body, { color: spec.bodyColor }]} numberOfLines={2}>
              {spec.body}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              ldClient.track(LD_EVENT_PROMO_BANNER_CTA_CLICK, {
                flagKey: LD_FLAG_PROMO_BANNER_VARIANT,
                variation: key,
              });
              router.push(spec.route);
            }}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: spec.ctaBg },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={spec.cta}
          >
            <Text style={[styles.ctaText, { color: spec.ctaText }]}>{spec.cta}</Text>
          </Pressable>
        </View>
        <Text style={[styles.flagHint, { color: spec.bodyColor }]} numberOfLines={1}>
          {LD_FLAG_PROMO_BANNER_VARIANT}: {key}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    position: "relative",
    overflow: "hidden",
  },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  inner: { paddingLeft: 20, paddingRight: 16, paddingBottom: 8, paddingTop: 2 },
  mainRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 17, marginTop: -1 },
  copy: { flex: 1, minWidth: 0, paddingRight: 4 },
  eyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: { fontFamily: fontFamily.bold, fontSize: 15, lineHeight: 19, marginBottom: 3 },
  body: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  cta: {
    flexShrink: 0,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  ctaText: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.2 },
  flagHint: {
    marginTop: 6,
    marginLeft: 46,
    fontFamily: fontFamily.regular,
    fontSize: 9,
    opacity: 0.8,
  },
  pressed: { opacity: 0.88 },
});
