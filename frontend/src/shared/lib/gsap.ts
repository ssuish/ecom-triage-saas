import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Motion tokens mapped from DESIGN.md Editorial Precision */
export const motion = {
  duration: {
    instant: 0.08,
    fast: 0.16,
    base: 0.24,
    reveal: 0.6,
    shimmerSweep: 0.8,
  },
  ease: {
    standard: "power2.out",
    reveal: "power3.out",
    spring: "back.out(1.2)",
  },
  reveal: {
    y: 12,
    yWide: 20,
    heroY: 8,
    stagger: 0.08,
  },
  pathDraw: {
    duration: 1.2,
    ease: "none",
  },
} as const;

gsap.defaults({
  duration: motion.duration.base,
  ease: motion.ease.standard,
});

export { gsap, ScrollTrigger };
