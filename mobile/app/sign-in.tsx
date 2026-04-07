import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { DEFAULT_DEMO_SIGN_IN_PROFILE, demoEmailForSwitchProfile } from "../src/data/demoContent";
import { isLocalDemoAuthEnabled } from "../src/lib/localDemoAuth";
import { colors, fontFamily, radii } from "../src/theme/tokens";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Sign in failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function onDemoSignIn() {
    setBusy(true);
    try {
      const p = DEFAULT_DEMO_SIGN_IN_PROFILE;
      await signUp(p.name, demoEmailForSwitchProfile(p), "demo");
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Demo sign in failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.accentLine} />
        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subheading}>Sign in to continue your journey</Text>
        {isLocalDemoAuthEnabled() ? (
          <>
            <Text style={styles.demoHint}>
              Demo mode: no server. Use any email and password — LaunchDarkly gets this user context after you sign in.
            </Text>
            <View style={styles.gap16} />
            <Pressable
              style={({ pressed }) => [styles.demoBtn, pressed && styles.pressed, busy && styles.disabled]}
              onPress={() => void onDemoSignIn()}
              disabled={busy}
            >
              <Text style={styles.demoBtnLabel}>Demo Sign In</Text>
              <Text style={styles.demoBtnSub}>
                {DEFAULT_DEMO_SIGN_IN_PROFILE.name} · switch profile from the home menu later
              </Text>
            </Pressable>
          </>
        ) : null}
        <View style={styles.gap32} />
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.foregroundMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.gap16} />
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.foregroundMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.gap24} />
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, busy && styles.disabled]}
          onPress={onSubmit}
          disabled={busy}
        >
          <Text style={styles.primaryBtnLabel}>{busy ? "SIGNING IN…" : "SIGN IN"}</Text>
        </Pressable>
        <View style={styles.gap24} />
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>New here? </Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={styles.bottomLink}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  scroll: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.accentPrimary,
    marginBottom: 24,
    borderRadius: 2,
  },
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.foregroundPrimary,
  },
  subheading: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontStyle: "italic",
    color: colors.foregroundSecondary,
    marginTop: 8,
  },
  demoHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.foregroundMuted,
    marginTop: 12,
    lineHeight: 18,
  },
  demoBtn: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    backgroundColor: colors.surfaceCard,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  demoBtnLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.accentPrimary,
    letterSpacing: 0.3,
  },
  demoBtnSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 6,
    textAlign: "center",
  },
  gap32: { height: 32 },
  gap16: { height: 16 },
  gap24: { height: 24 },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.foregroundSecondary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 16,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.foregroundPrimary,
    backgroundColor: colors.surfaceCard,
  },
  primaryBtn: {
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.foregroundInverse,
  },
  bottomRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  bottomText: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.foregroundMuted },
  bottomLink: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.accentPrimary },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.6 },
});
