import { queryOptions, useQuery } from "@tanstack/react-query";
import { getTicketStatus } from "@/shared/api/tickets";

export function ticketStatusQuery(id: string, token: string) {
  return queryOptions({
    queryKey: ["ticket-status", id, token],
    queryFn: ({ signal }) => getTicketStatus(id, token, signal),
    enabled: Boolean(id && token),
  });
}

export function useTicketStatus(id: string, token: string) {
  return useQuery(ticketStatusQuery(id, token));
}
