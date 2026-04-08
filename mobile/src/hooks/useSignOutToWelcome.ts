import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Clears the session; `signOut` navigates to `/welcome` (avoids `index` vs `(tabs)/index` replace ambiguity).
 */
export function useSignOutToWelcome() {
  const { signOut } = useAuth();

  return useCallback(async () => {
    await signOut();
  }, [signOut]);
}
