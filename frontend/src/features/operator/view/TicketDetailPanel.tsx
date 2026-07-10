import { useEffect, useState } from "react";
import type { Agent } from "@/shared/api/tickets";
import { DetailPanelSkeleton } from "@/shared/components/Skeleton";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  useAssignTicket,
  useResolveTicket,
  useSaveReply,
  useTicketDetail,
} from "../controller/queries";

interface TicketDetailPanelProps {
  ticketId: string;
  token: string;
  authUserId: string;
  agents: Agent[];
}

export function TicketDetailPanel({ ticketId, token, authUserId, agents }: TicketDetailPanelProps) {
  const { data: ticket, isLoading, error } = useTicketDetail(authUserId, ticketId, token);
  const [replyDraft, setReplyDraft] = useState("");
  const saveReply = useSaveReply(authUserId);
  const resolveTicket = useResolveTicket(authUserId);
  const assignTicket = useAssignTicket(authUserId);

  useEffect(() => {
    if (!ticket) return;
    setReplyDraft(ticket.agent_reply ?? ticket.ai_draft_reply ?? "");
  }, [ticket]);

  if (isLoading) {
    return <DetailPanelSkeleton />;
  }

  if (error || !ticket) {
    return (
      <div className="p-6" role="alert">
        <p className="type-body text-destructive">Could not load ticket details.</p>
      </div>
    );
  }

  const isBusy = saveReply.isPending || resolveTicket.isPending || assignTicket.isPending;
  const hasTriageOutput = Boolean(ticket.ai_draft_reply);

  return (
    <div className="stack stack--lg overflow-y-auto p-4">
      <header className="stack stack--sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={ticket.status} type="status" />
          <StatusBadge value={ticket.priority} type="priority" aiProvenance={hasTriageOutput} />
          <StatusBadge value={ticket.category} type="category" aiProvenance={hasTriageOutput} />
          {ticket.escalate && <StatusBadge value={true} type="escalate" />}
        </div>
        <h2 className="type-h2 break-words text-ink">{ticket.subject}</h2>
        <p className="type-small text-ink-faint">
          {ticket.customer_name ?? "Customer"} · {ticket.customer_email}
        </p>
      </header>

      <div className="stack stack--sm">
        <p className="eyebrow">Customer message</p>
        <div className="card type-body break-words whitespace-pre-wrap text-ink-muted">
          {ticket.body}
        </div>
      </div>

      {ticket.ai_draft_reply && (
        <div className="ai-provenance stack stack--sm p-4">
          <p className="ai-badge">AI draft reply</p>
          <p className="type-small break-words whitespace-pre-wrap text-ink-muted">
            {ticket.ai_draft_reply}
          </p>
        </div>
      )}

      <div className="stack stack--sm">
        <label htmlFor="agent_reply" className="type-body font-medium text-ink">
          Reply to customer
        </label>
        <Textarea
          id="agent_reply"
          name="agent_reply"
          autoComplete="off"
          rows={6}
          value={replyDraft}
          onChange={(event) => setReplyDraft(event.target.value)}
          disabled={isBusy || ticket.status === "resolved"}
          placeholder="Edit the draft reply before sending…"
        />
      </div>

      <div className="stack stack--sm">
        <label htmlFor="assign_agent" className="type-body font-medium text-ink">
          Assign to
        </label>
        <Select
          value={ticket.assigned_agent_id ?? "unassigned"}
          disabled={isBusy || agents.length === 0}
          onValueChange={(agentId) => {
            if (!agentId || agentId === "unassigned") return;
            assignTicket.mutate({ id: ticket.id, agentId, token });
          }}
        >
          <SelectTrigger id="assign_agent" className="h-8 w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(saveReply.error || resolveTicket.error || assignTicket.error) && (
        <p className="type-body text-destructive" role="alert">
          {(saveReply.error ?? resolveTicket.error ?? assignTicket.error) instanceof Error
            ? (saveReply.error ?? resolveTicket.error ?? assignTicket.error)?.message
            : "Action failed."}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isBusy || ticket.status === "resolved" || !replyDraft.trim()}
          aria-busy={saveReply.isPending}
          onClick={() => saveReply.mutate({ id: ticket.id, agentReply: replyDraft.trim(), token })}
        >
          {saveReply.isPending ? "Saving…" : "Save reply"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy || ticket.status === "resolved" || !replyDraft.trim()}
          aria-busy={resolveTicket.isPending}
          onClick={() =>
            resolveTicket.mutate({
              id: ticket.id,
              token,
              agentReply: replyDraft.trim(),
            })
          }
        >
          {resolveTicket.isPending ? "Resolving…" : "Resolve ticket"}
        </Button>
      </div>
    </div>
  );
}
