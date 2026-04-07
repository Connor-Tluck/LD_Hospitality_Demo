import * as Application from "expo-application";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useSignOutToWelcome } from "../../src/hooks/useSignOutToWelcome";
import { profilePhotoUrl } from "../../src/data/demoContent";
import { colors, fontFamily, radii } from "../../src/theme/tokens";

const TAB_BAR_SPACE = 120;

const MENU = [
  "Personal Information",
  "Payment Methods",
  "Notifications",
  "Privacy & Security",
  "Help & Support",
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, org } = useAuth();
  const signOutToWelcome = useSignOutToWelcome();

  if (!user || !org) {
    return null;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profile</Text>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Image
              source={{ uri: profilePhotoUrl(user.id) }}
              style={styles.avatarPhoto}
              contentFit="cover"
              transition={200}
            />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PLATINUM MEMBER</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>12,450</Text>
            <Text style={styles.statLabel}>REWARD POINTS</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>8</Text>
            <Text style={styles.statLabel}>STAYS</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>UPCOMING</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.menuHeader}>Menu</Text>
        {MENU.map((label) => (
          <Pressable key={label} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
            <Text style={styles.menuText}>{label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
          onPress={() => void signOutToWelcome()}
        >
          <Text style={styles.signOutLabel}>Sign Out</Text>
        </Pressable>
        <Text style={styles.ver}>
          Version {Application.nativeApplicationVersion ?? "1.0.0"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  scroll: { paddingHorizontal: 24, paddingTop: 8 },
  screenTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 26,
    color: colors.foregroundPrimary,
    marginBottom: 24,
  },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    backgroundColor: colors.borderSubtle,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
  },
  avatarPhoto: { width: "100%", height: "100%" },
  badge: {
    marginTop: -12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceInverse,
  },
  badgeText: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.accentLight,
  },
  userName: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    color: colors.foregroundPrimary,
    marginTop: 12,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 24,
  },
  stat: { alignItems: "center", flex: 1 },
  statNum: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.foregroundPrimary,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.foregroundMuted,
    marginTop: 4,
  },
  statDiv: { width: 1, height: 36, backgroundColor: colors.borderSubtle },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginBottom: 16 },
  menuHeader: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.foregroundMuted,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  menuText: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.foregroundPrimary,
  },
  chevron: { fontSize: 20, color: colors.foregroundMuted },
  signOutBtn: {
    marginTop: 24,
    height: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "#B5564F",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: "#B5564F",
  },
  ver: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.foregroundMuted,
    textAlign: "center",
    marginTop: 24,
  },
  pressed: { opacity: 0.88 },
});
