import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fontFamily, radii } from "../../src/theme/tokens";

type PromoPage = {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefits: string[];
  ctaLabel: string;
  ctaRoute: string;
  gradient: [string, string, ...string[]];
  /** Dark hero → light text. */
  heroDark: boolean;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const PAGES: Record<string, PromoPage> = {
  rewards: {
    eyebrow: "Elevate Rewards",
    title: "Earn on every stay",
    subtitle: "Points on stays, dining, and entertainment — plus member rates before anyone else.",
    benefits: ["Member-only nightly rates", "Points on dining & shows", "Early access to new openings", "Free to join"],
    ctaLabel: "Join Elevate Rewards",
    ctaRoute: "/sign-up",
    gradient: ["#FFFDF7", "#F8F0DD", colors.surfacePrimary],
    heroDark: false,
    accent: colors.accentPrimary,
    icon: "sparkles",
  },
  platinum: {
    eyebrow: "Platinum Concierge",
    title: "Your suite upgrade awaits",
    subtitle: "Complimentary upgrades, late checkout, and a dedicated concierge on your next stay.",
    benefits: ["Complimentary suite upgrades", "Guaranteed 4pm late checkout", "Dedicated concierge line", "Priority dining & show seats"],
    ctaLabel: "Explore suites",
    ctaRoute: "/explore",
    gradient: ["#1C1A17", "#2D2926", "#3A332B"],
    heroDark: true,
    accent: colors.accentLight,
    icon: "diamond",
  },
  gold: {
    eyebrow: "Gold Member Offer",
    title: "Double points this weekend",
    subtitle: "Earn 2× reward points on stays and dining — exclusive to Gold members through Sunday.",
    benefits: ["2× points on stays", "2× points on dining", "Bonus points on shows", "Stackable with member rates"],
    ctaLabel: "Book & earn 2×",
    ctaRoute: "/explore",
    gradient: ["#FBEFC9", "#F1D98B", "#E6C25E"],
    heroDark: false,
    accent: colors.accentDark,
    icon: "star",
  },
  standard: {
    eyebrow: "Member Rates",
    title: "Unlock member pricing",
    subtitle: "Sign in to access member pricing on stays, dining, and experiences across our properties.",
    benefits: ["Lower nightly rates", "Members-only experiences", "Flexible cancellation", "Points on every booking"],
    ctaLabel: "Browse member rates",
    ctaRoute: "/explore",
    gradient: ["#FFFDF7", "#F8F0DD", colors.surfacePrimary],
    heroDark: false,
    accent: colors.accentPrimary,
    icon: "pricetags",
  },
  guest: {
    eyebrow: "Join Free",
    title: "Create your rewards account",
    subtitle: "Sign up free to earn points, unlock member rates, and get exclusive offers on every stay.",
    benefits: ["Free to join in seconds", "Earn points from day one", "Member-only rates", "Exclusive welcome offer"],
    ctaLabel: "Create free account",
    ctaRoute: "/sign-up",
    gradient: ["#E8F0EA", "#D6E7DC", "#C5DCCD"],
    heroDark: false,
    accent: colors.success,
    icon: "add-circle",
  },
};

export default function PromoDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const page = PAGES[key ?? ""] ?? PAGES.rewards;

  const titleColor = page.heroDark ? colors.foregroundInverse : colors.foregroundPrimary;
  const subColor = page.heroDark ? "rgba(245,242,233,0.82)" : colors.foregroundSecondary;

  return (
    <View style={styles.root}>
      <StatusBar style={page.heroDark ? "light" : "dark"} />
      <LinearGradient
        colors={page.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 8 }]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            { borderColor: page.heroDark ? "rgba(245,242,233,0.4)" : colors.borderSubtle },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={titleColor} />
        </Pressable>
        <View style={[styles.iconWrap, { backgroundColor: page.heroDark ? "rgba(196,169,106,0.18)" : "rgba(125,107,61,0.1)", borderColor: page.accent }]}>
          <Ionicons name={page.icon} size={26} color={page.accent} />
        </View>
        <Text style={[styles.eyebrow, { color: page.accent }]}>{page.eyebrow.toUpperCase()}</Text>
        <Text style={[styles.title, { color: titleColor }]}>{page.title}</Text>
        <Text style={[styles.subtitle, { color: subColor }]}>{page.subtitle}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.benefitsLabel}>WHAT YOU GET</Text>
        {page.benefits.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={page.accent} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          onPress={() => router.push(page.ctaRoute)}
          style={({ pressed }) => [styles.cta, { backgroundColor: page.accent }, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={page.ctaLabel}
        >
          <Text style={[styles.ctaText, { color: page.heroDark ? "#1C1A17" : colors.foregroundInverse }]}>
            {page.ctaLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: "94%",
  },
  scroll: { paddingHorizontal: 24, paddingTop: 28 },
  benefitsLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.foregroundMuted,
    marginBottom: 16,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  benefitText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.foregroundPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
  },
  cta: {
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontFamily: fontFamily.semibold, fontSize: 16, letterSpacing: 0.3 },
  pressed: { opacity: 0.9 },
});
