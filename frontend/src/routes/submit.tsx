import { createFileRoute } from "@tanstack/react-router";
import { TicketSubmitForm } from "@/features/submit";
import { MarketingPageChrome } from "@/shared/components/MarketingPageChrome";

export const Route = createFileRoute("/submit")({
  component: SubmitRoute,
});

function SubmitRoute() {
  return (
    <MarketingPageChrome
      backTo="/"
      backLabel="Back to home"
      mainClassName="page-container page-container--narrow density-comfortable py-10"
    >
      <TicketSubmitForm />
    </MarketingPageChrome>
  );
}
