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
import { colors, fontFamily, radii } from "../src/theme/tokens";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (password !== confirm) {
      Alert.alert("Check passwords", "Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      Alert.alert("Terms", "Please accept the terms to continue.");
      return;
    }
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Sign up failed", e instanceof Error ? e.message : "Unknown error");
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
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Join us to unlock experiences</Text>
        <View style={styles.gap24} />
        <Text style={styles.label}>FULL NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor={colors.foregroundMuted}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.gap16} />
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
        <View style={styles.gap16} />
        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.foregroundMuted}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
        <View style={styles.gap16} />
        <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms(!acceptedTerms)}>
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]} />
          <Text style={styles.termsText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </Pressable>
        <View style={styles.gap24} />
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, busy && styles.disabled]}
          onPress={onSubmit}
          disabled={busy}
        >
          <Text style={styles.primaryBtnLabel}>{busy ? "CREATING…" : "CREATE ACCOUNT"}</Text>
        </Pressable>
        <View style={styles.gap24} />
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={styles.bottomLink}>Sign in</Text>
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
  gap24: { height: 24 },
  gap16: { height: 16 },
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
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: 2,
    backgroundColor: colors.surfaceCard,
  },
  checkboxOn: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  termsText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.foregroundSecondary,
    lineHeight: 20,
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
