import { useMutation } from "@tanstack/react-query";
import { createTicket, type TicketCreatePayload } from "@/shared/api/tickets";

export function useCreateTicket() {
  return useMutation({ mutationFn: (payload: TicketCreatePayload) => createTicket(payload) });
}
