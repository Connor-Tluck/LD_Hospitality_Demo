import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../src/context/AuthContext";
import { demoEmailForSwitchProfile, SWITCH_USER_PROFILES } from "../src/data/demoContent";
import { colors, fontFamily, radii } from "../src/theme/tokens";

/**
 * Matches "Home - Switch User Modal" in Hospitality.pen — demo-only profile picker (local session names).
 */
export default function SwitchUserModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <Text style={styles.title}>Switch User</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Select a profile for the demo</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {SWITCH_USER_PROFILES.map((p) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => {
              void signUp(p.name, demoEmailForSwitchProfile(p), "demo").then(() => router.back());
            }}
          >
            <View style={styles.avatar}>
              <Image source={{ uri: p.avatarUrl }} style={styles.avatarPhoto} contentFit="cover" />
            </View>
            <View style={styles.textCol}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{p.name}</Text>
                <View style={[styles.betaPill, p.isBetaUser ? styles.betaPillYes : styles.betaPillNo]}>
                  <Text style={[styles.betaPillText, p.isBetaUser ? styles.betaPillTextYes : styles.betaPillTextNo]}>
                    {p.isBetaUser ? "Beta" : "Standard"}
                  </Text>
                </View>
              </View>
              <Text style={styles.sub}>{p.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 17,
    color: colors.foregroundPrimary,
  },
  cancel: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.accentPrimary,
    width: 60,
    textAlign: "right",
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundMuted,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  list: { paddingHorizontal: 24, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.borderSubtle,
  },
  avatarPhoto: { width: "100%", height: "100%" },
  textCol: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.foregroundPrimary,
    flex: 1,
    flexShrink: 1,
  },
  betaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  betaPillYes: {
    backgroundColor: "rgba(74, 124, 89, 0.14)",
    borderColor: "rgba(74, 124, 89, 0.4)",
  },
  betaPillNo: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
  },
  betaPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  betaPillTextYes: {
    color: colors.success,
  },
  betaPillTextNo: {
    color: colors.foregroundMuted,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.foregroundMuted,
    marginTop: 2,
  },
  pressed: { opacity: 0.85 },
});
