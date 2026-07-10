import { cn } from "@/shared/lib/utils";
import type { RowPhase } from "./queue-demo";
import { ShimmerLinearGradient } from "./ShimmerGradientDefs";

interface QueueVisualizationSVGProps {
  activeIndex: number;
  phases: RowPhase[];
  className?: string;
}

const BAR_CONFIG = [
  { x: 32, queuedHeight: 20, triagingHeight: 44, triagedHeight: 64 },
  { x: 88, queuedHeight: 20, triagingHeight: 44, triagedHeight: 72 },
  { x: 144, queuedHeight: 20, triagingHeight: 44, triagedHeight: 56 },
] as const;

const BASELINE = 100;

function barHeight(phase: RowPhase, config: (typeof BAR_CONFIG)[number]): number {
  if (phase === "triaged") return config.triagedHeight;
  if (phase === "triaging") return config.triagingHeight;
  return config.queuedHeight;
}

function barFill(phase: RowPhase, isActive: boolean): string {
  if (phase === "triaged") return "var(--chrome-primary)";
  if (phase === "triaging") return "var(--surface)";
  return isActive ? "var(--surface)" : "var(--canvas)";
}

function barFillOpacity(phase: RowPhase): number {
  if (phase === "triaged") return 0.2;
  return 1;
}

function barStroke(phase: RowPhase): string {
  if (phase === "triaging") return "url(#queue-shimmer)";
  if (phase === "triaged") return "var(--chrome-primary)";
  return "var(--border-mid)";
}

function barStrokeWidth(phase: RowPhase): number {
  return phase === "triaging" ? 2 : 1;
}

export function QueueVisualizationSVG({
  activeIndex,
  phases,
  className,
}: QueueVisualizationSVGProps) {
  return (
    <svg
      viewBox="0 0 176 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("queue-viz", className)}
    >
      <defs>
        <ShimmerLinearGradient id="queue-shimmer" direction="diagonal" />
      </defs>

      <g stroke="var(--grid-line)" strokeWidth="1">
        <line x1="0" y1="32" x2="176" y2="32" />
        <line x1="0" y1="64" x2="176" y2="64" />
        <line x1="58" y1="0" x2="58" y2="112" />
        <line x1="116" y1="0" x2="116" y2="112" />
      </g>

      {BAR_CONFIG.map((config, index) => {
        const phase = phases[index] ?? "queued";
        const height = barHeight(phase, config);
        const isActive = index === activeIndex;

        return (
          <rect
            key={index}
            x={config.x}
            y={BASELINE - height}
            width="24"
            height={height}
            rx="2"
            fill={barFill(phase, isActive)}
            fillOpacity={barFillOpacity(phase)}
            stroke={barStroke(phase)}
            strokeWidth={barStrokeWidth(phase)}
            className="queue-viz__bar"
          />
        );
      })}
    </svg>
  );
}
