import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useClerkAuth } from "@/shared/hooks/useClerkAuth";

export function useOperatorAuth() {
  const queryClient = useQueryClient();
  const { getBearerToken, isLoaded, userId, signOut } = useClerkAuth();

  useEffect(() => {
    return () => {
      queryClient.clear();
    };
  }, [queryClient]);

  const {
    data: token,
    isLoading: tokenLoading,
    isError: tokenError,
    error: tokenErrorDetail,
  } = useQuery({
    queryKey: ["operator-token", userId],
    queryFn: getBearerToken,
    enabled: isLoaded && Boolean(userId),
    staleTime: 60_000,
    retry: false,
  });

  const signOutAndClearCache = useCallback(async () => {
    queryClient.clear();
    await signOut();
  }, [queryClient, signOut]);

  return {
    token,
    tokenLoading,
    tokenError,
    tokenErrorDetail,
    userId,
    isLoaded,
    signOutAndClearCache,
  };
}
