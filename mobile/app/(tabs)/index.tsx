import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useSignOutToWelcome } from "../../src/hooks/useSignOutToWelcome";
import { FEATURED_HOTELS, HOME_EXPERIENCE_TILES, profilePhotoUrl } from "../../src/data/demoContent";
import { LD_FLAG_DEMO_HOME_PROMO } from "../../src/lib/ld/flags";
import { colors, fontFamily, radii } from "../../src/theme/tokens";
const TAB_BAR_SPACE = 120;

export default function HomeTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, org } = useAuth();
  const signOutToWelcome = useSignOutToWelcome();
  const demoHomeEnabled = useBoolVariation(LD_FLAG_DEMO_HOME_PROMO, false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user || !org) {
    return null;
  }

  const firstName = user.name.split(" ")[0] ?? "Guest";

  const scrollTopPad = demoHomeEnabled ? 16 : insets.top + 8;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {demoHomeEnabled ? (
        <LinearGradient
          colors={["#FFFDF7", "#F8F0DD", colors.surfacePrimary]}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.promoBanner, { paddingTop: insets.top }]}
        >
          <View style={styles.promoAccent} />
          <View style={styles.promoInner}>
            <View style={styles.promoMainRow}>
              <View style={styles.promoIconWrap}>
                <Text style={styles.promoIcon} accessibilityLabel="Rewards">
                  ✦
                </Text>
              </View>
              <View style={styles.promoCopy}>
                <Text style={styles.promoEyebrow}>Exclusive preview</Text>
                <Text style={styles.promoTitle} numberOfLines={2}>
                  Join Elevate Rewards
                </Text>
                <Text style={styles.promoBody} numberOfLines={2}>
                  Earn points on stays, dining, and entertainment—and unlock member rates before anyone else.
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/explore")}
                style={({ pressed }) => [styles.promoCta, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="See rewards benefits"
              >
                <Text style={styles.promoCtaText}>See benefits</Text>
              </Pressable>
            </View>
            <Text style={styles.promoFlagHint} numberOfLines={1}>
              Preview flag: {LD_FLAG_DEMO_HOME_PROMO}
            </Text>
          </View>
        </LinearGradient>
      ) : null}
      <ScrollView
        style={styles.scrollMain}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: scrollTopPad, paddingBottom: TAB_BAR_SPACE + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.greetSub}>Where shall we take you today?</Text>
          </View>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          >
            <Image
              source={{ uri: profilePhotoUrl(user.id) }}
              style={styles.avatarImg}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchPlaceholder}>Search hotels, dining, experiences...</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Hotels</Text>
            <Text style={styles.sectionLink}>SEE ALL</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {FEATURED_HOTELS.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => router.push(`/hotel/${h.id}`)}
                style={({ pressed }) => [styles.hotelCard, pressed && styles.pressed]}
              >
                <Image source={{ uri: h.imageUrl }} style={styles.hotelHero} contentFit="cover" transition={200} />
                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelName}>{h.name}</Text>
                  <Text style={styles.hotelLoc}>{h.location}</Text>
                  <Text style={styles.hotelPrice}>{h.priceLabel}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Experiences</Text>
            <Link href="/explore" asChild>
              <Pressable>
                <Text style={styles.sectionLink}>SEE ALL</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.expRow}>
            {HOME_EXPERIENCE_TILES.map((t) => (
              <View key={t.tag} style={styles.expTile}>
                <Image source={{ uri: t.imageUrl }} style={styles.expImg} contentFit="cover" transition={200} />
                <View style={styles.expOverlay}>
                  <Text style={styles.expLabel}>{t.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dropdownUserRow}>
              <View style={styles.dropdownAvatar}>
                <Image
                  source={{ uri: profilePhotoUrl(user.id) }}
                  style={styles.dropdownAvatarImg}
                  contentFit="cover"
                />
              </View>
              <View>
                <Text style={styles.dropdownName}>{user.name}</Text>
                <Text style={styles.dropdownEmail}>{user.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
              onPress={() => {
                setMenuOpen(false);
                router.push("/switch-user");
              }}
            >
              <Text style={styles.menuRowText}>Switch User</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.menuRowDanger, pressed && styles.pressed]}
              onPress={() => {
                setMenuOpen(false);
                void signOutToWelcome();
              }}
            >
              <Text style={styles.menuRowDangerText}>Sign Out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  scrollMain: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  promoBanner: {
    width: "100%",
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    position: "relative",
    overflow: "hidden",
  },
  promoAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accentPrimary,
  },
  promoInner: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingBottom: 8,
    paddingTop: 2,
  },
  promoMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  promoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(125, 107, 61, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(196, 169, 106, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  promoIcon: {
    fontSize: 17,
    color: colors.accentDark,
    marginTop: -1,
  },
  promoCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  promoEyebrow: {
    fontFamily: fontFamily.medium,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.accentPrimary,
    marginBottom: 2,
  },
  promoTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 19,
    color: colors.foregroundPrimary,
    marginBottom: 3,
  },
  promoBody: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.foregroundSecondary,
  },
  promoCta: {
    flexShrink: 0,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  promoCtaText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.2,
    color: colors.foregroundInverse,
  },
  promoFlagHint: {
    marginTop: 6,
    marginLeft: 46,
    fontFamily: fontFamily.regular,
    fontSize: 9,
    color: colors.foregroundMuted,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    color: colors.foregroundPrimary,
  },
  greetSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundSecondary,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.borderSubtle,
  },
  avatarImg: { width: "100%", height: "100%" },
  searchBar: {
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  searchPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.foregroundMuted,
  },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.foregroundPrimary,
  },
  sectionLink: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.accentPrimary,
  },
  hScroll: { gap: 12, paddingRight: 8 },
  hotelCard: {
    width: 220,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
  },
  hotelHero: { height: 120, width: "100%", backgroundColor: colors.borderSubtle },
  hotelInfo: { padding: 12 },
  hotelName: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.foregroundPrimary,
  },
  hotelLoc: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.foregroundSecondary,
    marginTop: 2,
  },
  hotelPrice: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.accentPrimary,
    marginTop: 4,
  },
  expRow: { flexDirection: "row", gap: 8 },
  expTile: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  expImg: { ...StyleSheet.absoluteFillObject },
  expOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    padding: 8,
  },
  expLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.foregroundInverse,
  },
  pressed: { opacity: 0.88 },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(45,41,38,0.45)",
    justifyContent: "flex-start",
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  dropdown: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
  },
  dropdownUserRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dropdownAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.borderSubtle,
  },
  dropdownAvatarImg: { width: "100%", height: "100%" },
  dropdownName: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.foregroundPrimary,
  },
  dropdownEmail: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.foregroundMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 12,
  },
  menuRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  menuRowText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundPrimary,
  },
  menuRowDanger: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  menuRowDangerText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: "#B5564F",
  },
});
