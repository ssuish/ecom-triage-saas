import { useRef, type ReactNode } from "react";
import { gsap, motion, ScrollTrigger } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { useSVGPathReveal } from "@/shared/hooks/useSVGPathReveal";
import { cn } from "@/shared/lib/utils";

type SectionMotifVariant = "roadmap" | "feedback" | "cta";

interface SectionMotifSVGProps {
  variant: SectionMotifVariant;
  className?: string;
}

function RoadmapMotif() {
  const svgRef = useSVGPathReveal();

  return (
    <svg
      ref={svgRef}
      className="section-bg-illustration__svg"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="680"
        y1="80"
        x2="720"
        y2="140"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <line
        x1="720"
        y1="140"
        x2="640"
        y2="180"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <line
        x1="640"
        y1="180"
        x2="760"
        y2="220"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <line
        x1="760"
        y1="220"
        x2="700"
        y2="300"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <line
        x1="120"
        y1="320"
        x2="180"
        y2="280"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <circle cx="680" cy="80" r="5" fill="var(--grid-line)" className="motif-node" />
      <circle cx="720" cy="140" r="4" fill="var(--grid-line)" className="motif-node" />
      <circle cx="640" cy="180" r="3" fill="var(--grid-line)" className="motif-node" />
      <circle cx="760" cy="220" r="4" fill="var(--grid-line)" className="motif-node" />
      <circle cx="700" cy="300" r="5" fill="var(--grid-line)" className="motif-node" />
      <circle cx="120" cy="320" r="4" fill="var(--grid-line)" className="motif-node" />
      <circle cx="180" cy="280" r="3" fill="var(--grid-line)" className="motif-node" />
    </svg>
  );
}

function FeedbackMotif() {
  const svgRef = useSVGPathReveal();

  return (
    <svg
      ref={svgRef}
      className="section-bg-illustration__svg"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="520"
        y="60"
        width="200"
        height="28"
        rx="4"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <rect
        x="520"
        y="104"
        width="200"
        height="28"
        rx="4"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <rect
        x="520"
        y="148"
        width="200"
        height="80"
        rx="4"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path"
      />
      <line
        x1="540"
        y1="72"
        x2="620"
        y2="72"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path motif-node"
      />
      <line
        x1="540"
        y1="116"
        x2="600"
        y2="116"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path motif-node"
      />
      <line
        x1="540"
        y1="168"
        x2="700"
        y2="168"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path motif-node"
      />
      <line
        x1="540"
        y1="184"
        x2="680"
        y2="184"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path motif-node"
      />
      <line
        x1="540"
        y1="200"
        x2="660"
        y2="200"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-path motif-node"
      />
    </svg>
  );
}

function CtaMotif() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = svgRef.current;
      if (!svg) return;

      const circles = svg.querySelectorAll<SVGCircleElement>(".motif-node");
      const hub = svg.querySelector<SVGCircleElement>(".motif-hub");

      if (reducedMotion) {
        gsap.set([...circles, hub], { autoAlpha: 1, scale: 1 });
        return;
      }

      gsap.set(circles, {
        autoAlpha: 0,
        scale: 0.6,
        transformOrigin: "400px 150px",
        transformBox: "fill-box",
      });
      gsap.set(hub, { autoAlpha: 0, scale: 0 });

      const trigger = svg.closest(".section-bg-illustration") ?? svg;

      ScrollTrigger.create({
        trigger,
        start: "top 80%",
        once: true,
        onEnter: () => {
          if (hub) {
            gsap.to(hub, {
              autoAlpha: 1,
              scale: 1,
              duration: motion.duration.base,
              ease: motion.ease.spring,
              transformOrigin: "center center",
            });
          }

          gsap.to(circles, {
            autoAlpha: 1,
            scale: 1,
            duration: motion.duration.reveal,
            ease: motion.ease.reveal,
            stagger: motion.reveal.stagger,
            transformOrigin: "400px 150px",
          });
        },
      });
    },
    [],
    svgRef,
  );

  return (
    <svg
      ref={svgRef}
      className="section-bg-illustration__svg"
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="400"
        cy="150"
        r="60"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-node"
      />
      <circle
        cx="400"
        cy="150"
        r="100"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-node"
      />
      <circle
        cx="400"
        cy="150"
        r="140"
        stroke="var(--grid-line)"
        strokeWidth="1"
        className="motif-node"
      />
      <circle cx="400" cy="150" r="2" fill="var(--grid-line)" className="motif-hub" />
    </svg>
  );
}

const MOTIF_COMPONENTS: Record<SectionMotifVariant, () => ReactNode> = {
  roadmap: RoadmapMotif,
  feedback: FeedbackMotif,
  cta: CtaMotif,
};

export function SectionMotifSVG({ variant, className }: SectionMotifSVGProps) {
  const Motif = MOTIF_COMPONENTS[variant];

  return (
    <div className={cn("section-bg-illustration", className)} aria-hidden="true">
      <Motif />
    </div>
  );
}
