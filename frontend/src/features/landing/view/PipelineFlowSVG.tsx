import { useRef } from "react";
import { gsap, motion } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { cn } from "@/shared/lib/utils";
import { ShimmerLinearGradient } from "./ShimmerGradientDefs";

interface PipelineFlowSVGProps {
  processing?: boolean;
  className?: string;
}

const STAGE_CYCLE_DURATION = 2.4;
const STAGE_PAUSE = 0.4;

const STAGES = [
  { id: "intake", label: "Intake", x: 72 },
  { id: "triage", label: "Triage", x: 200 },
  { id: "resolve", label: "Resolve", x: 328 },
] as const;

function clearStageHighlights(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGGElement>(".pipeline-flow__stage").forEach((stage) => {
    stage.classList.remove("pipeline-flow__stage--active");
  });
}

function buildStageCycleTimeline(svg: SVGSVGElement) {
  const intakeStage = svg.querySelector<SVGGElement>(".pipeline-flow__stage--intake");
  const triageStage = svg.querySelector<SVGGElement>(".pipeline-flow__stage--triage");
  const resolveStage = svg.querySelector<SVGGElement>(".pipeline-flow__stage--resolve");
  const primaryParticle = svg.querySelector<SVGGElement>(".pipeline-flow__particle--1");
  const extraParticles = svg.querySelectorAll<SVGGElement>(
    ".pipeline-flow__particle--2, .pipeline-flow__particle--3",
  );

  extraParticles.forEach((particle) => gsap.set(particle, { autoAlpha: 0 }));

  const tl = gsap.timeline({ repeat: -1, repeatDelay: STAGE_PAUSE });

  tl.call(() => {
    clearStageHighlights(svg);
    intakeStage?.classList.add("pipeline-flow__stage--active");
  });
  tl.to({}, { duration: STAGE_CYCLE_DURATION * 0.28 });
  tl.call(() => {
    intakeStage?.classList.remove("pipeline-flow__stage--active");
    triageStage?.classList.add("pipeline-flow__stage--active");
  });
  tl.to({}, { duration: STAGE_CYCLE_DURATION * 0.36 });
  tl.call(() => {
    triageStage?.classList.remove("pipeline-flow__stage--active");
    resolveStage?.classList.add("pipeline-flow__stage--active");
  });
  tl.to({}, { duration: STAGE_CYCLE_DURATION * 0.28 });
  tl.call(() => resolveStage?.classList.remove("pipeline-flow__stage--active"));

  if (primaryParticle) {
    tl.fromTo(
      primaryParticle,
      { x: 40, autoAlpha: 0 },
      { x: 360, autoAlpha: 1, duration: STAGE_CYCLE_DURATION, ease: "none" },
      0,
    );
    tl.to(primaryParticle, { autoAlpha: 0, duration: 0.15 }, STAGE_CYCLE_DURATION - 0.1);
  }

  return tl;
}

function startAmbientMotion(svg: SVGSVGElement) {
  const baseline = svg.querySelector<SVGLineElement>(".pipeline-flow__baseline");
  const connectors = svg.querySelectorAll<SVGPathElement>(".pipeline-flow__connector");

  if (baseline) {
    gsap.fromTo(
      baseline,
      { strokeDashoffset: 320, autoAlpha: 0.3 },
      {
        strokeDashoffset: -320,
        autoAlpha: 0.8,
        duration: 6,
        repeat: -1,
        ease: "sine.inOut",
      },
    );
  }

  connectors.forEach((connector) => {
    const length = connector.getTotalLength();
    gsap.set(connector, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(connector, {
      strokeDashoffset: 0,
      duration: motion.pathDraw.duration,
      repeat: -1,
      ease: motion.pathDraw.ease,
      repeatDelay: 1.5,
    });
  });
}

export function PipelineFlowSVG({ processing = false, className }: PipelineFlowSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stageCycleRef = useRef<gsap.core.Timeline | null>(null);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg || reducedMotion) return;

      const stages = svg.querySelectorAll<SVGGElement>(".pipeline-flow__stage");

      startAmbientMotion(svg);
      stageCycleRef.current = buildStageCycleTimeline(svg);

      gsap.from(stages, {
        autoAlpha: 0,
        y: 8,
        duration: motion.duration.base,
        stagger: 0.12,
        ease: motion.ease.standard,
      });

      return () => {
        stageCycleRef.current?.kill();
        stageCycleRef.current = null;
        clearStageHighlights(svg);
      };
    },
    [],
    svgRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg || reducedMotion) return;

      const triageNode = svg.querySelector<SVGCircleElement>(".pipeline-flow__triage-node");
      const prismIcon = svg.querySelector<SVGPolygonElement>(".pipeline-flow__prism-icon");

      if (!processing) {
        if (triageNode) gsap.set(triageNode, { clearProps: "filter" });
        if (prismIcon) gsap.set(prismIcon, { clearProps: "scale" });
        return;
      }

      if (triageNode) {
        gsap.to(triageNode, {
          filter:
            "drop-shadow(0 0 6px color-mix(in srgb, var(--status-in-progress) 35%, transparent))",
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (prismIcon) {
        gsap.to(prismIcon, {
          scale: 1.06,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "center center",
        });
      }

      return () => {
        if (triageNode) gsap.set(triageNode, { clearProps: "filter" });
        if (prismIcon) gsap.set(prismIcon, { clearProps: "scale" });
      };
    },
    [processing],
    svgRef,
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("pipeline-flow", processing && "pipeline-flow--processing", className)}
    >
      <defs>
        <ShimmerLinearGradient id="pipeline-shimmer" />
        <marker id="pipeline-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--ink-faint)" />
        </marker>
      </defs>

      <line x1="40" y1="60" x2="360" y2="60" stroke="var(--grid-line)" strokeWidth="1" />
      <line
        x1="40"
        y1="60"
        x2="360"
        y2="60"
        stroke="url(#pipeline-shimmer)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 320"
        className="pipeline-flow__baseline"
      />

      <g className="pipeline-flow__particle pipeline-flow__particle--1">
        <circle cx="0" cy="60" r="3" fill="var(--ink-faint)" />
      </g>
      <g className="pipeline-flow__particle pipeline-flow__particle--2">
        <circle cx="0" cy="60" r="3" fill="var(--ink-faint)" />
      </g>
      <g className="pipeline-flow__particle pipeline-flow__particle--3">
        <circle cx="0" cy="60" r="3" fill="var(--ink-faint)" />
      </g>

      {STAGES.map(({ id, label, x }, index) => (
        <g
          key={id}
          className={cn(
            "pipeline-flow__stage",
            `pipeline-flow__stage--${id}`,
            `pipeline-flow__stage--delay-${index}`,
          )}
        >
          <circle
            cx={x}
            cy={60}
            r={id === "triage" ? 22 : 16}
            fill="var(--surface)"
            stroke={id === "triage" ? "url(#pipeline-shimmer)" : "var(--border-mid)"}
            strokeWidth={id === "triage" ? 2 : 1}
            className={cn(id === "triage" && "pipeline-flow__triage-node")}
          />

          {id === "intake" && (
            <g transform={`translate(${x - 8}, 52)`}>
              <rect x="0" y="0" width="16" height="12" rx="2" stroke="var(--ink-muted)" strokeWidth="1" fill="none" />
              <line x1="3" y1="4" x2="13" y2="4" stroke="var(--ink-faint)" strokeWidth="1" />
              <line x1="3" y1="7" x2="10" y2="7" stroke="var(--ink-faint)" strokeWidth="1" />
            </g>
          )}
          {id === "triage" && (
            <polygon
              points={`${x},44 ${x + 10},60 ${x},76 ${x - 10},60`}
              fill="none"
              stroke="url(#pipeline-shimmer)"
              strokeWidth="1"
              className="pipeline-flow__prism-icon"
            />
          )}
          {id === "resolve" && (
            <g transform={`translate(${x - 8}, 50)`}>
              <rect x="0" y="0" width="16" height="18" rx="2" stroke="var(--ink-muted)" strokeWidth="1" fill="none" />
              <polyline
                points="3,10 7,14 13,6"
                stroke="var(--status-success)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          <text
            x={x}
            y="98"
            textAnchor="middle"
            fill="var(--ink-faint)"
            fontSize="8"
            fontFamily="var(--font-mono)"
            letterSpacing="0.04em"
          >
            {label}
          </text>

          {index < STAGES.length - 1 && (
            <path
              d={`M ${x + 20} 60 L ${STAGES[index + 1].x - 20} 60`}
              stroke="var(--border-mid)"
              strokeWidth="1"
              markerEnd="url(#pipeline-arrow)"
              className="pipeline-flow__connector"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
