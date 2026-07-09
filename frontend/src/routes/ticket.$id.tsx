import { createFileRoute } from "@tanstack/react-router";
import { CustomerStatusPage, validateTicketSearch } from "@/features/ticket-status";

export { validateTicketSearch };

export const Route = createFileRoute("/ticket/$id")({
  validateSearch: validateTicketSearch,
  component: TicketStatusRoute,
});

function TicketStatusRoute() {
  const { id } = Route.useParams();
  const { token } = Route.useSearch();

  return <CustomerStatusPage ticketId={id} token={token} />;
}
