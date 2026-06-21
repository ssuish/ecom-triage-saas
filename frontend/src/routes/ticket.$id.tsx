import { createFileRoute } from "@tanstack/react-router";
import { CustomerStatusPage } from "@/components/CustomerStatusPage";

export const Route = createFileRoute("/ticket/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: TicketStatusRoute,
});

function TicketStatusRoute() {
  const { id } = Route.useParams();
  const { token } = Route.useSearch();

  return <CustomerStatusPage ticketId={id} token={token} />;
}
