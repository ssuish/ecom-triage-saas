import { CustomerStatusPage } from "@/components/CustomerStatusPage";
import { parseTicketRoute } from "@/lib/ticketRoute";

export default function App() {
  const route = parseTicketRoute(window.location.pathname, window.location.search);

  if (route) {
    return <CustomerStatusPage ticketId={route.ticketId} token={route.token} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Triage Support</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit a request from our support form, then track it from the link in your confirmation email.
        </p>
      </div>
    </main>
  );
}
