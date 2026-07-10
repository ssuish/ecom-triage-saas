import { useRef } from "react";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { gsap } from "@/shared/lib/gsap";
import { cn } from "@/shared/lib/utils";
import type { RowPhase } from "./queue-demo";

const QUEUE_ROWS = [
  {
    id: "a8f3c2e1",
    subject: "Charged twice for subscription",
    priority: "high",
  },
  {
    id: "b1d4e7f2",
    subject: "Password reset not arriving",
    priority: "medium",
  },
  {
    id: "c9a2b5d8",
    subject: "Cancel annual plan",
    priority: "low",
  },
] as const;

export interface OperatorConsoleMockProps {
  activeIndex: number;
  phases: RowPhase[];
  visibleSummaryIndex: number;
  summaries: string[];
}

export function OperatorConsoleMock({
  activeIndex,
  phases,
  visibleSummaryIndex,
  summaries,
}: OperatorConsoleMockProps) {
  const summaryRef = useRef<HTMLParagraphElement>(null);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const summary = summaryRef.current;
      if (!summary || reducedMotion) return;

      gsap.fromTo(
        summary,
        { autoAlpha: 0, y: 4 },
        { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" },
      );
    },
    [visibleSummaryIndex],
    summaryRef,
  );

  const openCount = phases.filter((phase) => phase !== "triaged").length;

  return (
    <div className="card overflow-hidden !p-0" aria-hidden="true">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Queue</p>
            <p className="type-h2 mt-1 text-ink">{openCount} open tickets</p>
          </div>
          <span className="console-mock__activity flex items-center gap-1.5 type-mono text-ink-faint">
            <span
              className="inline-block size-1.5 rounded-full bg-[var(--status-in-progress)]"
              aria-hidden="true"
            />
            Live
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {QUEUE_ROWS.map((row, index) => {
          const phase = phases[index] ?? "queued";
          const isSelected = index === activeIndex;
          const showPriority = phase === "triaged";
          const status = phase === "triaged" ? "in_progress" : "open";

          return (
            <div
              key={row.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-interactive",
                isSelected && "console-mock__row--selected",
                phase === "triaging" && "console-mock__row--triaging ai-provenance--processing",
              )}
            >
              <div className="min-w-0">
                <p className="type-body truncate font-medium text-ink">{row.subject}</p>
                <p className="ticket-id mt-1" title={row.id}>
                  {row.id}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={status} type="status" />
                {showPriority && <StatusBadge value={row.priority} type="priority" />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border px-4 py-3">
        <div className="ai-provenance stack stack--sm !rounded-none !border-0 !p-4">
          <p className="ai-badge">AI triage summary</p>
          <p ref={summaryRef} className="type-small text-ink-muted">
            {summaries[visibleSummaryIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
