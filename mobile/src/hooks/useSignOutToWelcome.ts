import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Clears the session; `(tabs)/_layout` runs a one-shot `router.replace("/")` in an effect
 * when `!user` so we do not replace from here after the Tabs navigator unmounts.
 */
export function useSignOutToWelcome() {
  const { signOut } = useAuth();

  return useCallback(async () => {
    await signOut();
  }, [signOut]);
}
