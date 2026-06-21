import { useEffect, useState } from "react";
import { getTicketStatus, type TicketStatusResponse } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface CustomerStatusPageProps {
  ticketId: string;
  token: string;
}

export function CustomerStatusPage({ ticketId, token }: CustomerStatusPageProps) {
  const [ticket, setTicket] = useState<TicketStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTicketStatus(ticketId, token)
      .then(setTicket)
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"))
      .finally(() => setLoading(false));
  }, [ticketId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading your ticket...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center">
        <p className="text-red-600 font-medium">Invalid link or ticket not found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          The link you followed may be invalid or the ticket may have been removed.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-lg mx-auto mt-16">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{ticket.subject}</CardTitle>
            <StatusBadge value={ticket.status} type="status" />
          </div>
          <p className="text-xs text-muted-foreground">
            Submitted {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.status === "open" && (
            <p className="text-sm text-muted-foreground">
              Your request has been received and is in the queue. We&apos;ll be in touch soon.
            </p>
          )}
          {ticket.status === "in_progress" && (
            <p className="text-sm text-muted-foreground">
              Our team is currently reviewing your request.
            </p>
          )}
          {ticket.agent_reply && (
            <div>
              <p className="text-sm font-medium mb-1">Response from our team</p>
              <div className="bg-muted rounded-md p-3 text-sm whitespace-pre-wrap">
                {ticket.agent_reply}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Last updated {new Date(ticket.updated_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
