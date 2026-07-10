import { useRef } from "react";
import { gsap, motion, ScrollTrigger } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";

interface UseSVGPathRevealOptions {
  pathSelector?: string;
  nodeSelector?: string;
  stagger?: number;
  onVisible?: () => void;
}

function preparePath(path: SVGGeometryElement): number {
  const length = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
    autoAlpha: 1,
  });
  return length;
}

/**
 * Scroll-triggered SVG path drawing with optional node fade-in.
 * Respects prefers-reduced-motion.
 */
export function useSVGPathReveal({
  pathSelector = ".motif-path",
  nodeSelector = ".motif-node",
  stagger = motion.reveal.stagger,
  onVisible,
}: UseSVGPathRevealOptions = {}) {
  const ref = useRef<SVGSVGElement>(null);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const svg = ref.current;
      if (!svg) return;

      const paths = svg.querySelectorAll<SVGGeometryElement>(pathSelector);
      const nodes = svg.querySelectorAll<SVGElement>(nodeSelector);

      if (paths.length === 0 && nodes.length === 0) return;

      if (reducedMotion) {
        paths.forEach((path) => {
          gsap.set(path, { strokeDashoffset: 0, autoAlpha: 1 });
        });
        gsap.set(nodes, { autoAlpha: 1, scale: 1 });
        onVisibleRef.current?.();
        return;
      }

      const pathLengths = Array.from(paths).map(preparePath);
      gsap.set(nodes, { autoAlpha: 0, scale: 0.92, transformOrigin: "center center" });

      const trigger = svg.closest(".section-bg-illustration") ?? svg;

      ScrollTrigger.create({
        trigger,
        start: "top 80%",
        once: true,
        onEnter: () => {
          paths.forEach((path, index) => {
            gsap.to(path, {
              strokeDashoffset: 0,
              duration: motion.pathDraw.duration,
              ease: motion.pathDraw.ease,
              delay: index * stagger,
            });
          });

          if (nodes.length > 0) {
            gsap.to(nodes, {
              autoAlpha: 1,
              scale: 1,
              duration: motion.duration.base,
              ease: motion.ease.standard,
              stagger,
              delay: pathLengths.length * stagger * 0.5,
            });
          }

          onVisibleRef.current?.();
        },
      });
    },
    [pathSelector, nodeSelector, stagger],
    ref,
  );

  return ref;
}
