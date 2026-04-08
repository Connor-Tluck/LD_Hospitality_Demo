import type { Org } from "@hospitality/shared";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, loginUser, registerUser } from "../lib/api";
import type { SessionUser } from "../lib/ld/buildContext";
import {
  buildLocalDemoSession,
  isLocalDemoAuthEnabled,
  LOCAL_DEMO_PROFILE_KEY,
  LOCAL_DEMO_TOKEN,
} from "../lib/localDemoAuth";

const TOKEN_KEY = "hospitality_session_token";

type AuthState = {
  token: string | null;
  user: SessionUser | null;
  org: Org | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const t = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!t) {
        setToken(null);
        setUser(null);
        setOrg(null);
        return;
      }
      if (isLocalDemoAuthEnabled() && t === LOCAL_DEMO_TOKEN) {
        const raw = await SecureStore.getItemAsync(LOCAL_DEMO_PROFILE_KEY);
        if (!raw) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setToken(null);
          setUser(null);
          setOrg(null);
          return;
        }
        const parsed = JSON.parse(raw) as { user: SessionUser; org: Org };
        setToken(t);
        setUser(parsed.user);
        setOrg(parsed.org);
        return;
      }
      const me = await fetchMe(t);
      setToken(t);
      setUser(me.user);
      setOrg(me.org);
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(LOCAL_DEMO_PROFILE_KEY);
      setToken(null);
      setUser(null);
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isLocalDemoAuthEnabled()) {
      if (!email.trim() || !password) {
        throw new Error("Enter email and password.");
      }
      const res = buildLocalDemoSession({ email });
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      await SecureStore.setItemAsync(LOCAL_DEMO_PROFILE_KEY, JSON.stringify({ user: res.user, org: res.org }));
      setToken(res.token);
      setUser(res.user);
      setOrg(res.org);
      return;
    }
    const res = await loginUser({ email, password });
    await SecureStore.setItemAsync(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    setOrg(res.org);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (isLocalDemoAuthEnabled()) {
      if (!email.trim() || !password) {
        throw new Error("Enter email and password.");
      }
      const res = buildLocalDemoSession({ email, name });
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      await SecureStore.setItemAsync(LOCAL_DEMO_PROFILE_KEY, JSON.stringify({ user: res.user, org: res.org }));
      setToken(res.token);
      setUser(res.user);
      setOrg(res.org);
      return;
    }
    const res = await registerUser({ name, email, password });
    await SecureStore.setItemAsync(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    setOrg(res.org);
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(LOCAL_DEMO_PROFILE_KEY);
    setToken(null);
    setUser(null);
    setOrg(null);
    // `replace("/")` targets screen name `index`, which clashes with `(tabs)/index` → unhandled REPLACE. Use `/welcome`.
    // `setTimeout` avoids dispatch during the same Fabric microtask pass as the state update.
    setTimeout(() => {
      router.replace("/welcome");
    }, 0);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      org,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [token, user, org, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
