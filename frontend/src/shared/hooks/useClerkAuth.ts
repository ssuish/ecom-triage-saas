import { useAuth } from "@clerk/react";
import { useCallback } from "react";

export function useClerkAuth() {
  const { getToken, isLoaded, isSignedIn, userId, signOut } = useAuth();

  const getBearerToken = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return token;
  }, [getToken]);

  return {
    getBearerToken,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    userId: userId ?? null,
    signOut,
  };
}
