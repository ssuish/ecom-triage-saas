import { useRef } from "react";
import { gsap, motion } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { cn } from "@/shared/lib/utils";
import { ShimmerLinearGradient } from "./ShimmerGradientDefs";

interface TriageNetworkSVGProps {
  active?: boolean;
  triaged?: boolean;
  className?: string;
}

const INPUT_NODES = [
  { cx: 48, cy: 52, delay: 0 },
  { cx: 36, cy: 108, delay: 1 },
  { cx: 56, cy: 164, delay: 2 },
  { cx: 40, cy: 220, delay: 3 },
  { cx: 64, cy: 276, delay: 4 },
] as const;

const OUTPUT_NODES = [
  { cx: 352, cy: 88, label: "Category" },
  { cx: 352, cy: 160, label: "Priority" },
  { cx: 352, cy: 232, label: "Summary" },
] as const;

export function TriageNetworkSVG({ active = false, triaged = false, className }: TriageNetworkSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg) return;

      const staticPaths = svg.querySelectorAll<SVGPathElement>(".triage-network__path");

      if (reducedMotion) {
        staticPaths.forEach((path) => gsap.set(path, { strokeDashoffset: 0, autoAlpha: 1 }));
        return;
      }

      staticPaths.forEach((path, index) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, autoAlpha: 0.45 });
        gsap.to(path, {
          strokeDashoffset: 0,
          autoAlpha: 1,
          duration: motion.pathDraw.duration,
          ease: motion.pathDraw.ease,
          delay: index * motion.reveal.stagger,
          repeat: -1,
          yoyo: true,
          repeatDelay: 1.2,
        });
      });
    },
    [],
    svgRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg || reducedMotion) return;

      const nodes = svg.querySelectorAll<SVGCircleElement>(".triage-network__node");
      const inFlows = svg.querySelectorAll<SVGPathElement>(
        ".triage-network__path-flow:not(.triage-network__path-flow--out)",
      );
      const prism = svg.querySelector<SVGGElement>(".triage-network__prism");

      nodes.forEach((node, index) => {
        gsap.to(node, {
          scale: 1.15,
          opacity: 0.7,
          duration: 1.2,
          delay: index * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "center center",
        });
      });

      inFlows.forEach((path, index) => {
        gsap.fromTo(
          path,
          { strokeDashoffset: 120, autoAlpha: 0 },
          {
            strokeDashoffset: -120,
            autoAlpha: 0.8,
            duration: 4,
            delay: index * 0.3,
            repeat: -1,
            ease: "none",
          },
        );
      });

      if (prism) {
        gsap.to(prism, {
          y: -3,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    [],
    svgRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg || reducedMotion) return;

      const prism = svg.querySelector<SVGGElement>(".triage-network__prism");
      const inFlows = svg.querySelectorAll<SVGPathElement>(
        ".triage-network__path-flow:not(.triage-network__path-flow--out)",
      );

      if (active && prism) {
        gsap.fromTo(
          prism,
          { scale: 1 },
          { scale: 1.06, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut", transformOrigin: "center center" },
        );
        gsap.to(inFlows, { autoAlpha: 1, duration: 0.4 });
      }
    },
    [active],
    svgRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg) return;

      const outputs = svg.querySelectorAll<SVGGElement>(".triage-network__output");
      const outFlows = svg.querySelectorAll<SVGPathElement>(".triage-network__path-flow--out");

      if (reducedMotion) {
        gsap.set(outputs, { autoAlpha: triaged ? 1 : 0.35, scale: triaged ? 1 : 0.92 });
        return;
      }

      if (triaged) {
        gsap.to(outputs, {
          autoAlpha: 1,
          scale: 1,
          duration: motion.duration.base,
          stagger: motion.reveal.stagger,
          ease: motion.ease.standard,
          transformOrigin: "center center",
        });

        outFlows.forEach((path, index) => {
          gsap.fromTo(
            path,
            { strokeDashoffset: 80, autoAlpha: 0.4 },
            {
              strokeDashoffset: -80,
              autoAlpha: 0.9,
              duration: 3,
              delay: index * 0.3,
              repeat: -1,
              ease: "none",
            },
          );
        });
      } else {
        gsap.set(outputs, { autoAlpha: 0.35, scale: 0.92 });

        outFlows.forEach((path, index) => {
          gsap.fromTo(
            path,
            { strokeDashoffset: 80, autoAlpha: 0.15 },
            {
              strokeDashoffset: -80,
              autoAlpha: 0.35,
              duration: 4,
              delay: index * 0.4,
              repeat: -1,
              ease: "none",
            },
          );
        });
      }
    },
    [triaged],
    svgRef,
  );

  return (
    <svg
      ref={svgRef}
      viewBox="-32 -24 464 368"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(
        "triage-network",
        active && "triage-network--active",
        triaged && "triage-network--triaged",
        className,
      )}
    >
      <defs>
        <ShimmerLinearGradient id="triage-network-shimmer" direction="diagonal" />
        <linearGradient id="triage-network-flow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--chrome-primary)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="var(--chrome-primary)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--chrome-primary)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g className="triage-network__grid" stroke="var(--grid-line)" strokeWidth="1">
        <line x1="0" y1="80" x2="400" y2="80" />
        <line x1="0" y1="160" x2="400" y2="160" />
        <line x1="0" y1="240" x2="400" y2="240" />
        <line x1="120" y1="0" x2="120" y2="320" />
        <line x1="280" y1="0" x2="280" y2="320" />
      </g>

      {INPUT_NODES.map(({ cx, cy, delay }, index) => (
        <g key={`in-${index}`}>
          <path
            d={`M ${cx} ${cy} C 100 ${cy}, 140 160, 200 160`}
            stroke="var(--border-mid)"
            strokeWidth="1"
            className="triage-network__path"
          />
          <path
            d={`M ${cx} ${cy} C 100 ${cy}, 140 160, 200 160`}
            stroke="url(#triage-network-flow)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="6 120"
            className={cn("triage-network__path-flow", `triage-network__path-flow--delay-${delay}`)}
          />
          <circle
            cx={cx}
            cy={cy}
            r="5"
            fill="var(--surface)"
            stroke="var(--ink-muted)"
            strokeWidth="1"
            className={cn("triage-network__node", `triage-network__node--delay-${delay}`)}
          />
        </g>
      ))}

      <g className="triage-network__prism" transform="translate(200, 160)">
        <circle r="3" fill="var(--chrome-primary)" fillOpacity="0.35" className="triage-network__hub" />
      </g>

      {OUTPUT_NODES.map(({ cx, cy, label }, index) => (
        <g key={`out-${index}`}>
          <path
            d={`M 200 160 C 260 160, 300 ${cy}, ${cx - 24} ${cy}`}
            stroke="var(--border-mid)"
            strokeWidth="1"
            className={cn("triage-network__path", triaged && "triage-network__path--lit")}
          />
          <path
            d={`M 200 160 C 260 160, 300 ${cy}, ${cx - 24} ${cy}`}
            stroke="url(#triage-network-flow)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="6 120"
            className={cn(
              "triage-network__path-flow triage-network__path-flow--out",
              `triage-network__path-flow--delay-${index}`,
            )}
          />
          <g className="triage-network__output" transform={`translate(${cx}, ${cy})`}>
            <rect
              x="-28"
              y="-14"
              width="56"
              height="28"
              rx="4"
              fill="var(--surface)"
              stroke="var(--border-mid)"
              strokeWidth="1"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="var(--ink-faint)"
              fontSize="8"
              fontFamily="var(--font-mono)"
              letterSpacing="0.06em"
            >
              {label}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
