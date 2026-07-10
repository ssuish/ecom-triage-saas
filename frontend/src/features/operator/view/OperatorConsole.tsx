import { UserButton } from "@clerk/react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ConsoleAuthSkeleton, QueueTableSkeleton } from "@/shared/components/Skeleton";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { clerkAppearance } from "@/shared/lib/clerk-appearance";
import { TICKETS_PAGE_SIZE, useAgents, useTicketsList } from "../controller/queries";
import { useOperatorAuth } from "../controller/useOperatorAuth";
import { TicketDetailPanel } from "./TicketDetailPanel";
import { TicketQueueTable } from "./TicketQueueTable";

const operatorRoute = getRouteApi("/operator");

const ALL_FILTER = "all";
const FILTER_STATUS_ID = "filter_status";
const FILTER_PRIORITY_ID = "filter_priority";

const STATUS_OPTIONS = [
  { value: ALL_FILTER, label: "All statuses" },
  { value: "open", label: "open" },
  { value: "in_progress", label: "in progress" },
  { value: "resolved", label: "resolved" },
] as const;

const PRIORITY_OPTIONS = [
  { value: ALL_FILTER, label: "All priorities" },
  { value: "low", label: "low" },
  { value: "medium", label: "medium" },
  { value: "high", label: "high" },
] as const;

export function OperatorConsole() {
  const navigate = operatorRoute.useNavigate();
  const search = operatorRoute.useSearch();
  const detailSectionRef = useRef<HTMLElement>(null);
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const {
    token,
    tokenLoading,
    tokenError,
    tokenErrorDetail,
    userId,
    isLoaded,
    signOutAndClearCache,
  } = useOperatorAuth();

  const filters = {
    status: search.status,
    priority: search.priority,
    page: search.page,
  };

  const { data: ticketPage, isLoading: ticketsLoading, error: ticketsError } = useTicketsList(
    userId,
    token ?? null,
    filters,
  );
  const { data: agents = [] } = useAgents(userId, token ?? null);

  const tickets = ticketPage?.items ?? [];
  const selectedId = search.ticketId ?? tickets[0]?.id;
  const highlightedId = tickets.some((ticket) => ticket.id === selectedId)
    ? selectedId
    : undefined;
  const currentPage = search.page ?? 1;
  const hasNextPage = ticketPage
    ? currentPage * TICKETS_PAGE_SIZE < ticketPage.total
    : false;
  const hasActiveFilters = Boolean(search.status || search.priority);
  const isGloballyEmpty = !ticketsLoading && !ticketsError && tickets.length === 0 && !hasActiveFilters;

  const updateSearch = (patch: Partial<typeof search>) => {
    navigate({ search: (current) => ({ ...current, ...patch }) });
  };

  useEffect(() => {
    const firstTicketId = ticketPage?.items[0]?.id;
    if (ticketsLoading || !token || !firstTicketId || search.ticketId) return;
    navigate({
      search: (current) => ({ ...current, ticketId: firstTicketId }),
      replace: true,
    });
  }, [ticketsLoading, token, ticketPage, search.ticketId, navigate]);

  const handleSelectTicket = (ticketId: string) => {
    const ticket = tickets.find((item) => item.id === ticketId);
    updateSearch({ ticketId });
    if (ticket) {
      setSelectionAnnouncement(`Selected ticket: ${ticket.subject}`);
    }
    detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  if (!isLoaded || tokenLoading) {
    return <ConsoleAuthSkeleton />;
  }

  if (tokenError) {
    return (
      <main
        id="main-content"
        className="density-compact flex min-h-[50vh] items-center justify-center p-6"
      >
        <div className="stack stack--sm text-center" role="alert">
          <p className="type-body text-destructive">
            {tokenErrorDetail instanceof Error
              ? tokenErrorDetail.message
              : "Could not authenticate. Sign in again to continue."}
          </p>
          <Button type="button" variant="outline" onClick={() => void signOutAndClearCache()}>
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectionAnnouncement}
      </div>
      <main id="main-content" className="density-compact flex min-h-dvh flex-col">
        <header className="border-b border-border bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="stack stack--sm">
              <p className="eyebrow">Operator</p>
              <h1 className="type-h2 text-ink">Ticket queue</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="type-small text-ink-muted hover:text-ink">
                Back to site
              </Link>
              <UserButton appearance={clerkAppearance} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label htmlFor={FILTER_STATUS_ID} className="stack stack--sm">
              <span className="type-small text-ink-faint">Status</span>
              <Select
                value={search.status ?? ALL_FILTER}
                onValueChange={(value) =>
                  updateSearch({
                    status: value === ALL_FILTER || value == null ? undefined : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger id={FILTER_STATUS_ID} className="h-8 min-w-[10rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label htmlFor={FILTER_PRIORITY_ID} className="stack stack--sm">
              <span className="type-small text-ink-faint">Priority</span>
              <Select
                value={search.priority ?? ALL_FILTER}
                onValueChange={(value) =>
                  updateSearch({
                    priority: value === ALL_FILTER || value == null ? undefined : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger id={FILTER_PRIORITY_ID} className="h-8 min-w-[10rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="min-h-0 min-w-0 overflow-y-auto border-b border-border lg:border-r lg:border-b-0">
            {ticketsLoading ? (
              <QueueTableSkeleton />
            ) : ticketsError ? (
              <p className="p-4 type-body text-destructive" role="alert">
                {ticketsError instanceof Error ? ticketsError.message : "Failed to load tickets."}
              </p>
            ) : isGloballyEmpty ? (
              <div className="stack stack--sm p-6 text-center" role="status">
                <p className="type-body font-medium text-ink">No tickets in queue</p>
                <p className="type-small text-ink-muted">
                  New submissions from the intake form will appear here after triage.
                </p>
                <Link to="/submit" className="type-small text-ink-muted hover:text-ink">
                  Preview submit flow
                </Link>
              </div>
            ) : token ? (
              <TicketQueueTable
                tickets={tickets}
                selectedId={highlightedId}
                onSelect={handleSelectTicket}
                hasActiveFilters={hasActiveFilters}
              />
            ) : (
              <p className="p-4 type-body text-ink-muted" role="status">
                Sign in to view the queue.
              </p>
            )}
            {ticketPage && ticketPage.total > tickets.length && (
              <div className="flex items-center justify-between border-t border-border p-3">
                <p className="type-small tabular-nums text-ink-faint">
                  Page {currentPage} · {ticketPage.total} tickets
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => updateSearch({ page: Math.max(1, currentPage - 1) })}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!hasNextPage}
                    onClick={() => updateSearch({ page: currentPage + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section
            ref={detailSectionRef}
            id="ticket-detail-panel"
            className="min-h-[20rem] min-w-0 bg-surface"
            aria-label="Ticket details"
          >
            {selectedId && token && userId ? (
              <TicketDetailPanel
                ticketId={selectedId}
                token={token}
                authUserId={userId}
                agents={agents}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <p className="type-body text-ink-muted" role="status">
                  Select a ticket to review.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
