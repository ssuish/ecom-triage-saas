import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "status" | "priority" | "escalate";

interface StatusBadgeProps {
  value: string | boolean;
  type: StatusType;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  low: "bg-gray-100 text-gray-700",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
};

export function StatusBadge({ value, type }: StatusBadgeProps) {
  if (type === "escalate") {
    if (!value) return null;
    return (
      <Badge className="bg-red-600 text-white text-xs font-semibold uppercase tracking-wide">
        Escalated
      </Badge>
    );
  }

  const label = String(value).replace("_", " ");
  const colorClass = STATUS_COLORS[String(value)] ?? "bg-gray-100 text-gray-700";

  return (
    <Badge className={cn("text-xs font-medium", colorClass)}>
      {label}
    </Badge>
  );
}
