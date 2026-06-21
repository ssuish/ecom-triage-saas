import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "status" | "priority" | "escalate";

interface StatusBadgeProps {
  value: string | boolean;
  type: StatusType;
}

const BASE_CLASSES =
  "font-mono text-[0.6875rem] font-medium tracking-widest uppercase px-1.5 py-0.5 rounded-sm";

const STATUS_CLASSES: Record<string, string> = {
  open: "border border-border text-foreground",
  in_progress: "text-[color:var(--ai-shimmer-border)]",
  resolved: "border border-border text-muted-foreground",
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").toUpperCase();
}

export function StatusBadge({ value, type }: StatusBadgeProps) {
  if (type === "escalate") {
    if (!value) return null;
    return (
      <Badge
        className={cn(
          BASE_CLASSES,
          "text-destructive border border-destructive/30"
        )}
      >
        Escalated
      </Badge>
    );
  }

  const label = formatLabel(String(value));
  const colorClass =
    type === "status"
      ? (STATUS_CLASSES[String(value)] ?? "border border-border text-muted-foreground")
      : "border border-border text-muted-foreground";

  return <Badge className={cn(BASE_CLASSES, colorClass)}>{label}</Badge>;
}
