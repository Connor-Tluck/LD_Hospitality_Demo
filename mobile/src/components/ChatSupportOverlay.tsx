import Ionicons from "@expo/vector-icons/Ionicons";
import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { fetchChatWelcome, postChatSupport, type ChatSupportTurn } from "../lib/api";
import { LD_FLAG_CHAT_SUPPORT } from "../lib/ld/flags";
import { colors, fontFamily, radii } from "../theme/tokens";

/** Clears the floating tab bar (see `(tabs)/_layout.tsx`). */
const TAB_BAR_CLEARANCE = 78;

export function ChatSupportOverlay() {
  const insets = useSafeAreaInsets();
  const { user, token, loading } = useAuth();
  const chatSupportOn = useBoolVariation(LD_FLAG_CHAT_SUPPORT, false);
  const [open, setOpen] = useState(false);
  /** Assistant welcome from LaunchDarkly AI Config (shown in UI only — not sent to chat API; server injects it via createChat). */
  const [ldWelcome, setLdWelcome] = useState<string | null>(null);
  /** User + model turns only (excludes ldWelcome). */
  const [thread, setThread] = useState<ChatSupportTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [welcomeError, setWelcomeError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!open || !token || !user) return;
    if (thread.length > 0) return;

    let cancelled = false;
    setWelcomeLoading(true);
    setWelcomeError(null);

    void (async () => {
      try {
        const { welcome } = await fetchChatWelcome(token, user);
        if (cancelled) return;
        const t = welcome.trim();
        setLdWelcome(t.length > 0 ? t : null);
      } catch (e) {
        if (!cancelled) {
          setLdWelcome(null);
          setWelcomeError(e instanceof Error ? e.message : "Could not load greeting.");
        }
      } finally {
        if (!cancelled) setWelcomeLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, token, user, thread.length]);

  const fabBottom = Math.max(insets.bottom, 12) + TAB_BAR_CLEARANCE;

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || !user || !token || sending) return;

    const userTurn: ChatSupportTurn = { role: "user", content: text };
    const nextThread = [...thread, userTurn];
    setThread(nextThread);
    setDraft("");
    setSending(true);
    setError(null);

    try {
      const { reply } = await postChatSupport(token, user, nextThread);
      setThread((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setThread((m) => m.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [draft, thread, sending, token, user]);

  const hasConversation = Boolean(ldWelcome?.trim()) || thread.length > 0;

  if (loading || !user || !token || !chatSupportOn) {
    return null;
  }

  return (
    <>
      <View style={[styles.fabWrap, { bottom: fabBottom }]} pointerEvents="box-none">
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityRole="button"
          accessibilityLabel="Open booking assistant chat"
        >
          <Ionicons name="chatbubble-ellipses" size={26} color={colors.foregroundInverse} />
        </Pressable>
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.sheetRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <View style={[styles.sheetHeader, { paddingTop: 12 + insets.top }]}>
            <View>
              <Text style={styles.sheetTitle}>Booking assistant</Text>
              <Text style={styles.sheetSubtitle}>Powered by LaunchDarkly AI Configs and OpenAI</Text>
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close chat"
            >
              <Ionicons name="close" size={28} color={colors.foregroundPrimary} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.threadScroll}
            contentContainerStyle={styles.threadContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {welcomeLoading && !hasConversation ? (
              <View style={styles.welcomeLoadingWrap}>
                <ActivityIndicator color={colors.accentPrimary} />
                <Text style={styles.welcomeLoadingLabel}>Loading greeting…</Text>
              </View>
            ) : null}
            {!welcomeLoading && !hasConversation && welcomeError ? (
              <Text style={styles.errorText}>{welcomeError}</Text>
            ) : null}
            {!welcomeLoading && !hasConversation && !welcomeError ? (
              <Text style={styles.hint}>
                Ask about dates, room types, or experiences. Add an assistant message (before any user message) in your
                LaunchDarkly AI Config to show a welcome here.
              </Text>
            ) : null}
            {ldWelcome?.trim() ? (
              <View style={[styles.bubbleWrap, styles.bubbleWrapAssistant]}>
                <View style={[styles.bubble, styles.bubbleAssistant]}>
                  <Text style={[styles.bubbleText, styles.bubbleTextAssistant]}>{ldWelcome.trim()}</Text>
                </View>
              </View>
            ) : null}
            {thread.map((m, i) => (
              <View
                key={`${i}-${m.role}`}
                style={[styles.bubbleWrap, m.role === "user" ? styles.bubbleWrapUser : styles.bubbleWrapAssistant]}
              >
                <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant]}>
                  <Text style={[styles.bubbleText, m.role === "user" ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
                    {m.content}
                  </Text>
                </View>
              </View>
            ))}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={[styles.composerRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message…"
              placeholderTextColor={colors.foregroundMuted}
              multiline
              maxLength={2000}
              editable={!sending}
              onSubmitEditing={() => void send()}
            />
            <Pressable
              onPress={() => void send()}
              style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
              disabled={!draft.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              {sending ? (
                <ActivityIndicator color={colors.foregroundInverse} size="small" />
              ) : (
                <Ionicons name="arrow-up" size={22} color={colors.foregroundInverse} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    right: 20,
    zIndex: 50,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: { opacity: 0.9 },
  sheetRoot: {
    flex: 1,
    backgroundColor: colors.surfacePrimary,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sheetTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    color: colors.foregroundPrimary,
  },
  sheetSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 4,
    maxWidth: 260,
  },
  threadScroll: { flex: 1 },
  threadContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.foregroundSecondary,
    marginBottom: 8,
  },
  welcomeLoadingWrap: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
  },
  welcomeLoadingLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.foregroundMuted,
  },
  bubbleWrap: {
    marginBottom: 10,
    maxWidth: "100%",
  },
  bubbleWrapUser: { alignSelf: "flex-end" },
  bubbleWrapAssistant: { alignSelf: "flex-start" },
  bubble: {
    maxWidth: "92%",
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.accentPrimary,
    borderBottomRightRadius: radii.sm,
  },
  bubbleAssistant: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: radii.sm,
  },
  bubbleText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextUser: { color: colors.foregroundInverse },
  bubbleTextAssistant: { color: colors.foregroundPrimary },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: "#A94442",
    marginTop: 8,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.foregroundPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.45 },
});
