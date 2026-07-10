import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useClerkAuth } from "@/shared/hooks/useClerkAuth";

const OPERATOR_QUERY_KEY_ROOTS = new Set([
  "operator-token",
  "tickets",
  "ticket",
  "agents",
]);

const isOperatorQuery = (query: { queryKey: readonly unknown[] }) =>
  OPERATOR_QUERY_KEY_ROOTS.has(query.queryKey[0] as string);

export function useOperatorAuth() {
  const queryClient = useQueryClient();
  const { getBearerToken, isLoaded, userId, signOut } = useClerkAuth();

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ predicate: isOperatorQuery });
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
    queryClient.removeQueries({ predicate: isOperatorQuery });
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
