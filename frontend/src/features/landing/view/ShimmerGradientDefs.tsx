interface ShimmerLinearGradientProps {
  id: string;
  direction?: "horizontal" | "diagonal";
}

export function ShimmerLinearGradient({
  id,
  direction = "horizontal",
}: ShimmerLinearGradientProps) {
  const coords =
    direction === "horizontal"
      ? { x1: "0%", y1: "0%", x2: "100%", y2: "0%" }
      : { x1: "0%", y1: "0%", x2: "100%", y2: "100%" };

  return (
    <linearGradient id={id} {...coords}>
      <stop offset="0%" stopColor="var(--status-in-progress)" />
      <stop offset="50%" stopColor="var(--ai-shimmer-mid)" />
      <stop offset="100%" stopColor="var(--ai-shimmer-end)" />
    </linearGradient>
  );
}
