import { useRef, useState } from "react";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { gsap } from "@/shared/lib/gsap";
import { OperatorConsoleMock } from "./OperatorConsoleMock";
import { QueueVisualizationSVG } from "./QueueVisualizationSVG";
import type { RowPhase } from "./queue-demo";

export type { RowPhase } from "./queue-demo";

const TICKET_COUNT = 3;
const TRIAGING_MS = 1.4;
const HOLD_MS = 2;

const SUMMARIES = [
  "Duplicate billing — customer charged twice within 48 hours for the same plan tier.",
  "Reset email not delivered — SPF misconfiguration likely blocking transactional mail.",
  "Annual cancellation request — verify contract end date before processing refund.",
] as const;

const INITIAL_PHASES: RowPhase[] = ["triaged", "queued", "queued"];

interface QueueDemoState {
  activeIndex: number;
  phases: RowPhase[];
  visibleSummaryIndex: number;
}

const INITIAL_STATE: QueueDemoState = {
  activeIndex: 0,
  phases: INITIAL_PHASES,
  visibleSummaryIndex: 0,
};

function clonePhases(phases: RowPhase[]): RowPhase[] {
  return [...phases];
}

export function OperatorVisual() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [demoState, setDemoState] = useState<QueueDemoState>(INITIAL_STATE);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      if (reducedMotion) {
        setDemoState(INITIAL_STATE);
        return;
      }

      const tl = gsap.timeline({ repeat: -1, delay: 1 });

      tl.call(() => setDemoState(INITIAL_STATE));
      tl.to({}, { duration: HOLD_MS });

      for (let ticketIndex = 1; ticketIndex < TICKET_COUNT; ticketIndex += 1) {
        tl.call(() => {
          setDemoState((current) => ({
            activeIndex: ticketIndex,
            phases: (() => {
              const phases = clonePhases(current.phases);
              phases[ticketIndex] = "triaging";
              return phases;
            })(),
            visibleSummaryIndex: current.visibleSummaryIndex,
          }));
        });
        tl.to({}, { duration: TRIAGING_MS });
        tl.call(() => {
          setDemoState((current) => ({
            activeIndex: ticketIndex,
            phases: (() => {
              const phases = clonePhases(current.phases);
              phases[ticketIndex] = "triaged";
              return phases;
            })(),
            visibleSummaryIndex: ticketIndex,
          }));
        });
        tl.to({}, { duration: HOLD_MS });
      }

      tl.call(() => {
        setDemoState(INITIAL_STATE);
      });
      tl.to({}, { duration: HOLD_MS });

      return () => {
        tl.kill();
      };
    },
    [prefersReducedMotion],
    containerRef,
  );

  return (
    <div ref={containerRef} className="operator-visual">
      <QueueVisualizationSVG
        activeIndex={demoState.activeIndex}
        phases={demoState.phases}
        className="operator-visual__bg"
      />
      <div className="operator-visual__mock">
        <OperatorConsoleMock
          activeIndex={demoState.activeIndex}
          phases={demoState.phases}
          visibleSummaryIndex={demoState.visibleSummaryIndex}
          summaries={[...SUMMARIES]}
        />
      </div>
    </div>
  );
}
