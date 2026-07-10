import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { gsap, motion } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { cn } from "@/shared/lib/utils";

const SWEEP_MS = 1400;
const AUTOPLAY_DELAY_MS = 1200;
const ANNOUNCEMENT = "Ticket triaged: Shipping, High priority.";

export interface TriagePrismState {
  sweeping: boolean;
  triaged: boolean;
}

interface TriagePrismProps {
  onStateChange?: (state: TriagePrismState) => void;
  className?: string;
}

export function TriagePrism({ onStateChange, className }: TriagePrismProps = {}) {
  const prismRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [triaged, setTriaged] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [hint, setHint] = useState("Run demo");
  const autoplayRef = useRef(false);
  const triageTimeoutRef = useRef<number | null>(null);

  const runTriage = useCallback(() => {
    if (prefersReducedMotion) {
      setTriaged(true);
      setHint("Replay demo");
      setAnnouncement(ANNOUNCEMENT);
      return;
    }

    setTriaged(false);
    setHint("Triaging…");
    setSweeping(true);
    setAnnouncement("");
    if (triageTimeoutRef.current !== null) {
      window.clearTimeout(triageTimeoutRef.current);
    }
    triageTimeoutRef.current = window.setTimeout(() => {
      triageTimeoutRef.current = null;
      setTriaged(true);
      setSweeping(false);
      setHint("Replay demo");
      setAnnouncement(ANNOUNCEMENT);
    }, SWEEP_MS);
  }, [prefersReducedMotion]);

  const handleClick = useCallback(() => {
    if (sweeping) return;
    runTriage();
  }, [runTriage, sweeping]);

  useEffect(() => {
    if (autoplayRef.current) return;
    autoplayRef.current = true;
    const timer = window.setTimeout(runTriage, AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [runTriage]);

  useEffect(() => {
    return () => {
      if (triageTimeoutRef.current !== null) {
        window.clearTimeout(triageTimeoutRef.current);
        triageTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    onStateChange?.({ sweeping, triaged });
  }, [onStateChange, sweeping, triaged]);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const sweep = sweepRef.current;
      if (!sweep || !sweeping || reducedMotion) return;

      gsap.fromTo(
        sweep,
        { x: "-100%", autoAlpha: 0.6 },
        {
          x: "100%",
          autoAlpha: 0,
          duration: motion.duration.shimmerSweep,
          ease: motion.ease.standard,
        },
      );
    },
    [sweeping],
    prismRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const processing = processingRef.current;
      if (!processing || !sweeping || reducedMotion) return;

      gsap.set(processing, { backgroundSize: "200% 200%" });
      gsap.to(processing, {
        backgroundPosition: "100% 50%",
        duration: 8,
        repeat: -1,
        ease: "none",
      });
    },
    [sweeping],
    prismRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const content = contentRef.current;
      if (!content || !triaged) return;

      const items = content.querySelectorAll("[data-triage-enter]");
      if (reducedMotion) {
        gsap.set(items, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.from(items, {
        autoAlpha: 0,
        y: motion.reveal.heroY,
        duration: motion.duration.base,
        stagger: motion.reveal.stagger,
        delay: 0.15,
        ease: motion.ease.standard,
      });
    },
    [triaged],
    prismRef,
  );

  return (
    <div
      ref={prismRef}
      className={cn("triage-prism", sweeping && "triage-prism--active", className)}
    >
      <div className="triage-prism__toolbar">
        <p className="eyebrow">Live triage demo</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="touch-target"
          onClick={handleClick}
          disabled={sweeping}
          aria-busy={sweeping}
        >
          {hint}
        </Button>
      </div>
      <div className="triage-prism__body" aria-live="polite">
        <div className="sr-only">{announcement}</div>
        <div ref={sweepRef} className="triage-prism__sweep" aria-hidden="true" />

        {!triaged ? (
          <div
            ref={processingRef}
            className={cn(
              "stack stack--sm p-5",
              sweeping && "ai-provenance ai-provenance--processing",
            )}
            aria-hidden="true"
          >
            <p className="type-mono text-ink-faint">RAW TICKET</p>
            <p>
              <span className="text-ink-faint">from:</span> sarah@acme.co
            </p>
            <p>
              <span className="text-ink-faint">subject:</span> (none)
            </p>
            <p className="leading-relaxed">
              hi i ordered something last week and it still hasnt arrived??? i need this for a gift
              and im really frustrated please help my order was #48291
            </p>
          </div>
        ) : (
          <div ref={contentRef} className="triage-prism__content stack stack--sm p-5">
            <div data-triage-enter className="flex flex-wrap gap-2">
              <span className="badge badge--in-progress">Shipping</span>
              <span className="badge badge--priority-high">High</span>
            </div>
            <div data-triage-enter className="ai-provenance ai-provenance--flush stack stack--sm">
              <p className="ai-badge mb-2">AI triage</p>
              <p className="type-body font-medium text-ink">
                Undelivered order — shipment lookup needed
              </p>
              <p className="type-small mt-2 text-ink-muted">
                Customer reports order #48291 placed over a week ago with no delivery. Gift deadline
                implied — prioritize carrier check and delivery update.
              </p>
            </div>
            <div data-triage-enter className="ai-provenance ai-provenance--flush stack stack--sm">
              <p className="ai-badge mb-2">Draft reply</p>
              <p className="type-small leading-relaxed text-ink-muted">
                Hi Sarah — thanks for reaching out. I found order #48291 and see it&apos;s still in
                transit. I&apos;m checking with our carrier now and will email you an updated delivery
                estimate within the hour.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
