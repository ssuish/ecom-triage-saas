import { useRef } from "react";
import { gsap, motion, ScrollTrigger } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";

interface UseGSAPRevealOptions {
  staggerIndex?: number;
  staggerChildren?: boolean;
  onVisible?: () => void;
  y?: number;
  variant?: "fade" | "fade-wide";
}

function getRevealChildren(element: HTMLElement): Element[] {
  const marked = element.querySelectorAll<HTMLElement>("[data-reveal]");
  if (marked.length > 0) return Array.from(marked);
  return Array.from(element.children);
}

function getRevealMotion(variant: "fade" | "fade-wide", y?: number) {
  if (variant === "fade-wide") {
    return {
      y: y ?? motion.reveal.yWide,
      duration: motion.duration.reveal,
      ease: motion.ease.reveal,
    };
  }
  return {
    y: y ?? motion.reveal.y,
    duration: motion.duration.base,
    ease: motion.ease.standard,
  };
}

/**
 * Scroll-triggered fade-up reveal. Respects prefers-reduced-motion.
 */
export function useGSAPReveal({
  staggerIndex = 0,
  staggerChildren = false,
  onVisible,
  y,
  variant = "fade",
}: UseGSAPRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;
  const revealMotion = getRevealMotion(variant, y);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const element = ref.current;
      if (!element) return;

      if (staggerChildren) {
        const children = getRevealChildren(element);

        if (reducedMotion) {
          gsap.set([element, ...children], { autoAlpha: 1, y: 0 });
          onVisibleRef.current?.();
          return;
        }

        gsap.set(element, { autoAlpha: 1 });
        children.forEach((child) => {
          const childMotion = child.hasAttribute("data-reveal-wide")
            ? getRevealMotion("fade-wide")
            : revealMotion;
          gsap.set(child, { autoAlpha: 0, y: childMotion.y });
        });

        ScrollTrigger.create({
          trigger: element,
          start: "top 85%",
          once: true,
          onEnter: () => {
            children.forEach((child, index) => {
              const childMotion = child.hasAttribute("data-reveal-wide")
                ? getRevealMotion("fade-wide")
                : revealMotion;

              gsap.to(child, {
                autoAlpha: 1,
                y: 0,
                duration: childMotion.duration,
                ease: childMotion.ease,
                delay: staggerIndex * motion.reveal.stagger + index * 0.09,
              });
            });
            gsap.delayedCall(
              staggerIndex * motion.reveal.stagger +
                (children.length - 1) * 0.09 +
                revealMotion.duration,
              () => onVisibleRef.current?.(),
            );
          },
        });
        return;
      }

      if (reducedMotion) {
        gsap.set(element, { autoAlpha: 1, y: 0 });
        onVisibleRef.current?.();
        return;
      }

      gsap.set(element, { autoAlpha: 0, y: revealMotion.y });

      ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(element, {
            autoAlpha: 1,
            y: 0,
            duration: revealMotion.duration,
            ease: revealMotion.ease,
            delay: staggerIndex * motion.reveal.stagger,
            onComplete: () => onVisibleRef.current?.(),
          });
        },
      });
    },
    [staggerChildren, staggerIndex, variant, y],
    ref,
  );

  return ref;
}
