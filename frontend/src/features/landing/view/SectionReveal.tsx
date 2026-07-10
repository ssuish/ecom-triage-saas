import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useGSAPReveal } from "@/shared/hooks/useGSAPReveal";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  staggerIndex?: number;
  staggerChildren?: boolean;
  onVisible?: () => void;
  variant?: "fade" | "fade-wide";
}

export function SectionReveal({
  children,
  className,
  staggerIndex,
  staggerChildren,
  onVisible,
  variant,
}: SectionRevealProps) {
  const ref = useGSAPReveal({ staggerIndex, staggerChildren, onVisible, variant });

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
