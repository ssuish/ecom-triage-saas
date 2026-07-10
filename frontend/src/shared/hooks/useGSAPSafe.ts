import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

type GSAPSetup = (
  context: gsap.Context,
  reducedMotion: boolean,
) => void | (() => void);

/**
 * Runs GSAP setup inside gsap.context() with automatic revert on unmount.
 * Pass `scope` to limit selector queries to a container ref.
 */
export function useGSAPSafe(
  setup: GSAPSetup,
  deps: readonly unknown[],
  scope?: RefObject<Element | null>,
) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = scope?.current;
    if (scope !== undefined && !root) return;

    let userCleanup: void | (() => void);

    const ctx = gsap.context((context) => {
      userCleanup = setup(context, prefersReducedMotion);
    }, root ?? undefined);

    return () => {
      if (typeof userCleanup === "function") userCleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls re-run via deps
  }, [prefersReducedMotion, scope, ...deps]);
}
