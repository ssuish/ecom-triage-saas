import { cn } from "@/shared/lib/utils";

type StatusType = "status" | "priority" | "category" | "escalate";

interface StatusBadgeProps {
  value: string | boolean;
  type: StatusType;
  aiProvenance?: boolean;
}

const STATUS_BADGE: Record<string, string> = {
  open: "badge--open",
  in_progress: "badge--in-progress",
  resolved: "badge--resolved",
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "badge--priority-high",
  medium: "badge--priority-medium",
  low: "badge--priority-low",
};

const CATEGORY_BADGE: Record<string, string> = {
  billing: "badge--category",
  technical: "badge--category",
  general: "badge--category",
  other: "badge--category",
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").toUpperCase();
}

export function StatusBadge({ value, type, aiProvenance = false }: StatusBadgeProps) {
  if (type === "escalate") {
    if (!value) return null;
    return <span className="badge badge--error">Escalated</span>;
  }

  const label = formatLabel(String(value));
  let badgeClass: string;
  if (type === "status") {
    badgeClass = STATUS_BADGE[String(value)] ?? "badge--open";
  } else if (type === "category") {
    badgeClass = CATEGORY_BADGE[String(value)] ?? "badge--category";
  } else {
    badgeClass = PRIORITY_BADGE[String(value)] ?? "badge--priority-low";
  }

  const showAiShimmer =
    aiProvenance && (type === "category" || type === "priority");

  return <span className={cn("badge", badgeClass)}>{showAiShimmer ? <span className="ai-badge">{label}</span> : label}</span>;
}
