import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignTicket,
  getTicket,
  listAgents,
  listTickets,
  resolveTicket,
  saveReply,
} from "@/shared/api/tickets";

/** Matches backend default `page_size` on GET /tickets. */
export const TICKETS_PAGE_SIZE = 50;

export interface TicketListFilters {
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
}

export function ticketsListQuery(
  authUserId: string,
  token: string,
  filters: TicketListFilters,
) {
  return queryOptions({
    queryKey: ["tickets", authUserId, filters],
    queryFn: ({ signal }) => listTickets({ ...filters, token, signal }),
    enabled: Boolean(authUserId && token),
  });
}

export function useTicketsList(
  authUserId: string | null | undefined,
  token: string | null,
  filters: TicketListFilters,
) {
  return useQuery({
    ...ticketsListQuery(authUserId ?? "", token ?? "", filters),
    enabled: Boolean(authUserId && token),
  });
}

export function ticketDetailQuery(authUserId: string, id: string, token: string) {
  return queryOptions({
    queryKey: ["ticket", authUserId, id],
    queryFn: ({ signal }) => getTicket(id, token, signal),
    enabled: Boolean(authUserId && id && token),
  });
}

export function useTicketDetail(
  authUserId: string | null | undefined,
  id: string | null,
  token: string | null,
) {
  return useQuery({
    ...ticketDetailQuery(authUserId ?? "", id ?? "", token ?? ""),
    enabled: Boolean(authUserId && id && token),
  });
}

export function agentsQuery(authUserId: string, token: string) {
  return queryOptions({
    queryKey: ["agents", authUserId],
    queryFn: ({ signal }) => listAgents(token, signal),
    enabled: Boolean(authUserId && token),
  });
}

export function useAgents(authUserId: string | null | undefined, token: string | null) {
  return useQuery({
    ...agentsQuery(authUserId ?? "", token ?? ""),
    enabled: Boolean(authUserId && token),
  });
}

export function useAssignTicket(authUserId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      agentId,
      token,
    }: {
      id: string;
      agentId: string;
      token: string;
    }) => assignTicket(id, agentId, token),
    onSuccess: (ticket) => {
      if (!authUserId) return;
      queryClient.invalidateQueries({ queryKey: ["tickets", authUserId] });
      queryClient.setQueryData(["ticket", authUserId, ticket.id], ticket);
    },
  });
}

export function useSaveReply(authUserId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      agentReply,
      token,
    }: {
      id: string;
      agentReply: string;
      token: string;
    }) => saveReply(id, agentReply, token),
    onSuccess: (ticket) => {
      if (!authUserId) return;
      queryClient.invalidateQueries({ queryKey: ["tickets", authUserId] });
      queryClient.setQueryData(["ticket", authUserId, ticket.id], ticket);
    },
  });
}

export function useResolveTicket(authUserId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      token,
      agentReply,
    }: {
      id: string;
      token: string;
      agentReply: string;
    }) => {
      const savedTicket = await saveReply(id, agentReply, token);
      if (authUserId) {
        queryClient.setQueryData(["ticket", authUserId, id], savedTicket);
        queryClient.invalidateQueries({ queryKey: ["tickets", authUserId] });
      }
      return resolveTicket(id, token);
    },
    onSuccess: (ticket) => {
      if (!authUserId) return;
      queryClient.invalidateQueries({ queryKey: ["tickets", authUserId] });
      queryClient.setQueryData(["ticket", authUserId, ticket.id], ticket);
    },
  });
}
