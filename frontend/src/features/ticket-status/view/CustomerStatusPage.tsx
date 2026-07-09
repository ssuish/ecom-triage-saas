import { formatDate } from "@/shared/lib/format";
import { MarketingPageChrome } from "@/shared/components/MarketingPageChrome";
import { StatusCardSkeleton } from "@/shared/components/Skeleton";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useTicketStatus } from "../controller/queries";

interface CustomerStatusPageProps {
  ticketId: string;
  token: string;
}

const mainClassName = "page-container page-container--narrow density-comfortable py-10";

export function CustomerStatusPage({ ticketId, token }: CustomerStatusPageProps) {
  const { data: ticket, isLoading, error } = useTicketStatus(ticketId, token);

  if (isLoading) {
    return (
      <MarketingPageChrome
        backTo="/"
        backLabel="Back to home"
        mainClassName={mainClassName}
      >
        <div role="status" aria-live="polite" aria-label="Loading your ticket">
          <StatusCardSkeleton />
        </div>
      </MarketingPageChrome>
    );
  }

  if (error || !ticket) {
    return (
      <MarketingPageChrome
        backTo="/"
        backLabel="Back to home"
        mainClassName={`${mainClassName} text-center`}
      >
        <div role="alert" className="stack stack--sm py-6">
          <p className="type-body font-medium text-destructive">
            Invalid link or ticket not found.
          </p>
          <p className="type-small prose-measure mx-auto text-ink-muted">
            The link you followed may be invalid or the ticket may have been removed.
          </p>
        </div>
      </MarketingPageChrome>
    );
  }

  return (
    <MarketingPageChrome
      backTo="/"
      backLabel="Back to home"
      mainClassName={mainClassName}
    >
      <article className="card stack stack--lg">
        <header className="stack stack--sm">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h1 className="type-h1 min-w-0 break-words text-ink">{ticket.subject}</h1>
            <StatusBadge value={ticket.status} type="status" />
          </div>
          <p className="type-small text-ink-faint">
            Submitted {formatDate(ticket.created_at)}
          </p>
        </header>

        <div className="stack stack--md">
          {ticket.status === "open" && (
            <p className="type-body prose-measure text-ink-muted">
              Your request has been received and is in the queue. We&apos;ll be in touch soon.
            </p>
          )}
          {ticket.status === "in_progress" && (
            <p className="type-body prose-measure text-ink-muted">
              Our team is currently reviewing your request.
            </p>
          )}
          {ticket.status === "resolved" && !ticket.agent_reply && (
            <p className="type-body prose-measure text-ink-muted">
              Your ticket has been resolved. If you need more help, submit a new request from our
              site.
            </p>
          )}
          {ticket.agent_reply && (
            <div className="stack stack--sm">
              <p className="type-body font-medium text-ink">Response from our team</p>
              <div className="rounded-md border border-border bg-muted p-3 type-body break-words whitespace-pre-wrap text-ink-muted">
                {ticket.agent_reply}
              </div>
            </div>
          )}
          <p className="type-small text-ink-faint">
            Last updated {formatDate(ticket.updated_at)}
          </p>
        </div>
      </article>
    </MarketingPageChrome>
  );
}
