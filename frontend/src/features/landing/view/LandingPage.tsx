import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { defaultOperatorSearch } from "@/features/operator";
import { FeedbackForm } from "@/features/submit";
import { MarketingHeader } from "@/shared/components/MarketingHeader";
import { SkipLink } from "@/shared/components/SkipLink";
import { gsap, motion, ScrollTrigger } from "@/shared/lib/gsap";
import { useGSAPSafe } from "@/shared/hooks/useGSAPSafe";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { useTallyScript } from "@/shared/hooks/useTallyScript";
import { cn } from "@/shared/lib/utils";
import { HeroBackground } from "./HeroBackground";
import { OperatorVisual } from "./OperatorVisual";
import { PipelineFlowSVG } from "./PipelineFlowSVG";
import { SectionMotifSVG } from "./SectionMotifSVG";
import { SectionReveal } from "./SectionReveal";
import { StatsBar } from "./StatsBar";
import { TriageNetworkSVG } from "./TriageNetworkSVG";
import { TriagePrism, type TriagePrismState } from "./TriagePrism";

function formatWaitlistCount(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return new Intl.NumberFormat().format(parsed);
}

const HOW_IT_WORKS = [
  {
    eyebrow: "Intake",
    title: "Customer submits a request",
    body: "Web form with name, email, and message. Confirmation email with a status link.",
  },
  {
    eyebrow: "Triage",
    title: "AI classifies and drafts a reply",
    body: "Category, priority, summary, and a suggested response — ready when your operator opens the ticket.",
    aiPreview: true,
  },
  {
    eyebrow: "Resolve",
    title: "Operator reviews and sends",
    body: "Edit the draft, assign ownership, resolve. The customer receives the reply by email.",
  },
] as const;

const ROADMAP_ITEMS = [
  {
    eyebrow: "Next",
    title: "Multi-channel intake",
    body: "Route messages from Facebook, Viber, WhatsApp, and other channels into the same triaged queue.",
  },
  {
    eyebrow: "Next",
    title: "Chat-based ticket intake",
    body: "A customer-facing chat widget gathers details in conversation, asks follow-ups, then opens a classified ticket in your queue.",
  },
  {
    eyebrow: "Later",
    title: "Knowledge base and RAG",
    body: "Connect help docs and product data so common questions are answered before a ticket is created.",
  },
  {
    eyebrow: "Later",
    title: "Operator gamification",
    body: "Streaks, milestones, and queue progress in the operator console — lightweight motivation for clearing triaged tickets.",
  },
] as const;

const EARLY_ACCESS_UNAVAILABLE_ID = "early-access-unavailable";

const TRIAGE_PROCESSING_MS = 2200;

function marketingButtonClass(variant: "default" | "ghost" = "default") {
  return cn(
    buttonVariants({ variant, size: "marketing" }),
    "marketing-link touch-target",
  );
}

function EarlyAccessButton({
  waitlistFormId,
  variant = "default",
  className,
}: {
  waitlistFormId: string;
  variant?: "default" | "ghost";
  className?: string;
}) {
  if (waitlistFormId) {
    return (
      <Button
        type="button"
        variant={variant}
        size="marketing"
        data-tally-open={waitlistFormId}
        data-tally-hide-title="1"
        data-tally-overlay="1"
        data-tally-auto-close="1000"
        data-tally-form-events-forwarding="1"
        className={cn("marketing-link touch-target", className)}
      >
        Get early access
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="marketing"
      disabled
      aria-disabled="true"
      aria-describedby={EARLY_ACCESS_UNAVAILABLE_ID}
      className={cn("marketing-link touch-target", className)}
    >
      Get early access
    </Button>
  );
}

export function LandingPage() {
  const waitlistFormId = import.meta.env.VITE_TALLY_FORM_ID ?? "";
  useTallyScript(Boolean(waitlistFormId));
  const waitlistCount = formatWaitlistCount(import.meta.env.VITE_WAITLIST_COUNT);
  const prefersReducedMotion = usePrefersReducedMotion();
  const heroSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const triageStepRef = useRef<HTMLLIElement>(null);
  const [triageProcessing, setTriageProcessing] = useState(false);
  const [triageDemoPlayed, setTriageDemoPlayed] = useState(false);
  const [prismState, setPrismState] = useState<TriagePrismState>({
    sweeping: false,
    triaged: false,
  });

  const handlePrismStateChange = useCallback((state: TriagePrismState) => {
    setPrismState(state);
  }, []);

  const handleHowItWorksVisible = useCallback(() => {
    if (prefersReducedMotion || triageDemoPlayed) return;
    setTriageDemoPlayed(true);
    setTriageProcessing(true);
    window.setTimeout(() => setTriageProcessing(false), TRIAGE_PROCESSING_MS);
  }, [prefersReducedMotion, triageDemoPlayed]);

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const section = heroSectionRef.current;
      if (!section) return;

      const eyebrow = section.querySelector(".hero-enter-eyebrow");
      const headline = section.querySelector(".hero-enter-headline");
      const body = section.querySelector(".hero-enter-body");
      const cta = section.querySelector(".hero-enter-cta");
      const visual = section.querySelector(".hero-triage-visual");
      const network = section.querySelector(".hero-triage-visual__network");
      const targets = [eyebrow, headline, body, cta, visual].filter(Boolean);

      if (reducedMotion) {
        gsap.set(targets, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(targets, { autoAlpha: 0, y: motion.reveal.heroY });

      const tl = gsap.timeline({ defaults: { ease: motion.ease.standard } });

      if (eyebrow) {
        tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: motion.duration.fast });
      }
      if (headline) {
        tl.to(
          headline,
          { autoAlpha: 1, y: 0, duration: motion.duration.base, ease: motion.ease.reveal },
          "-=0.04",
        );
      }
      if (body) {
        tl.to(body, { autoAlpha: 1, y: 0, duration: motion.duration.base }, "-=0.08");
      }
      if (cta) {
        tl.to(cta, { autoAlpha: 1, y: 0, duration: motion.duration.base }, "-=0.12");
      }
      if (visual) {
        gsap.set(visual, { scale: 0.98, transformOrigin: "center center" });
        tl.to(
          visual,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: motion.duration.reveal,
            ease: motion.ease.spring,
          },
          "-=0.08",
        );
      }

      if (network && section) {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) => {
            gsap.set(network, { y: self.progress * 24 });
          },
        });
      }
    },
    [],
    heroSectionRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const section = ctaSectionRef.current;
      if (!section || reducedMotion) return;

      gsap.from(section.querySelectorAll("[data-cta-enter]"), {
        autoAlpha: 0,
        y: motion.reveal.heroY,
        duration: motion.duration.base,
        stagger: 0.08,
        ease: motion.ease.standard,
      });
    },
    [],
    ctaSectionRef,
  );

  useGSAPSafe(
    (_ctx, reducedMotion) => {
      const step = triageStepRef.current;
      if (!step || !triageProcessing || reducedMotion) return;

      gsap.set(step, { backgroundSize: "200% 200%" });
      const tween = gsap.to(step, {
        backgroundPosition: "100% 50%",
        duration: 8,
        repeat: -1,
        ease: "none",
      });

      return () => {
        tween.kill();
        gsap.set(step, { clearProps: "backgroundSize,backgroundPosition" });
      };
    },
    [triageProcessing],
    triageStepRef,
  );

  return (
    <div className="marketing-shell page-shell">
      <div className="grain-overlay" aria-hidden="true" />
      <SkipLink />
      <MarketingHeader
        actions={<EarlyAccessButton waitlistFormId={waitlistFormId} />}
      />

      <main id="main-content" className="density-spacious precision-grid">
        {/* §1 Hero */}
        <section ref={heroSectionRef} className="precision-grid__section precision-grid__section--hero">
          <HeroBackground />
          <div className="page-container">
            <div className="split split--60-40">
              <div className="stack stack--lg">
                <p className="hero-enter-eyebrow eyebrow">Early access · For support teams and agencies</p>
                <h1 className="hero-enter-headline type-hero text-ink">
                  Every ticket arrives
                  <br />
                  classified and draft-ready.
                </h1>
                <p className="hero-enter-body type-body prose-measure text-ink-muted">
                  Triage gives SMB and agency support teams a single queue where every ticket
                  arrives with category, priority, summary, and a suggested reply — before anyone
                  opens it. Customers submit through a web form and track status by email link. No
                  account required.
                </p>
                <div className="hero-enter-cta marketing-cta-row mt-2">
                  <EarlyAccessButton waitlistFormId={waitlistFormId} />
                  <a href="#how-it-works" className={cn(marketingButtonClass("ghost"), "gap-1")}>
                    See how it works
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
                {(!waitlistFormId || waitlistCount) && (
                  <div className="stack stack--sm mt-4">
                    {!waitlistFormId && (
                      <p id={EARLY_ACCESS_UNAVAILABLE_ID} className="type-small text-ink-faint">
                        Early access opens soon.
                      </p>
                    )}
                    {waitlistCount && (
                      <p className="type-mono tabular-nums text-ink-faint">
                        {waitlistCount} teams requested early access
                      </p>
                    )}
                  </div>
                )}
              </div>
              <figure className="hero-triage-visual">
                <TriageNetworkSVG
                  active={prismState.sweeping}
                  triaged={prismState.triaged}
                  className="hero-triage-visual__network"
                />
                <TriagePrism
                  onStateChange={handlePrismStateChange}
                  className="hero-triage-visual__prism"
                />
              </figure>
            </div>
          </div>
        </section>

        <StatsBar />

        {/* §2 How it works */}
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="section-anchor precision-grid__section precision-grid__section--surface"
        >
          <div className="page-container">
            <SectionReveal
              className="stack stack--xl"
              staggerChildren
              onVisible={handleHowItWorksVisible}
            >
              <div data-reveal className="section-header">
                <p className="eyebrow">Pipeline</p>
                <h2 id="how-it-works-heading" className="type-h2-marketing text-ink">
                  How it works
                </h2>
                <p className="type-body section-header__description">
                  From first message to resolved ticket — one pipeline for your team and every client
                  queue you manage.
                </p>
              </div>
              <div data-reveal className="pipeline-flow-wrap">
                <PipelineFlowSVG processing={triageProcessing} />
              </div>
              <ol className="steps-grid">
                {HOW_IT_WORKS.map((step) => {
                  const isTriageStep = "aiPreview" in step && step.aiPreview;
                  return (
                    <li
                      key={step.eyebrow}
                      data-reveal
                      ref={isTriageStep ? triageStepRef : undefined}
                      className={cn(
                        "step-cell stack stack--sm",
                        isTriageStep && "ai-provenance",
                        isTriageStep && triageProcessing && "ai-provenance--processing",
                      )}
                    >
                      <p className="eyebrow">{step.eyebrow}</p>
                      <h3 className="type-h3 text-ink">{step.title}</h3>
                      <p className="type-body text-ink-muted">{step.body}</p>
                    </li>
                  );
                })}
              </ol>
            </SectionReveal>
          </div>
        </section>

        {/* §3 For operators */}
        <section
          id="for-operators"
          aria-labelledby="operators-heading"
          className="section-anchor precision-grid__section precision-grid__section--canvas"
        >
          <div className="page-container">
            <div className="split split--40-60">
              <SectionReveal>
                <div className="stack stack--lg">
                  <div className="section-header">
                    <p className="eyebrow">For operators</p>
                    <h2 id="operators-heading" className="type-h2-marketing text-ink">
                      Your queue, already triaged.
                    </h2>
                    <p className="type-body section-header__description">
                      Whether you run one support desk or several client queues, operators scan
                      status, priority, and AI summaries at a glance. Open a ticket with a draft
                      reply in place — edit, assign, and resolve without rebuilding the
                      conversation from scratch.
                    </p>
                  </div>
                  <div className="stack stack--sm">
                    <Link
                      to="/operator"
                      search={defaultOperatorSearch}
                      className={cn(marketingButtonClass("ghost"), "marketing-link w-fit gap-1")}
                    >
                      Operator console
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <p className="type-small text-ink-faint">Available to early access teams.</p>
                  </div>
                </div>
              </SectionReveal>
              <SectionReveal staggerIndex={1} className="desktop-only">
                <OperatorVisual />
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section
          id="roadmap"
          aria-labelledby="roadmap-heading"
          className="section-anchor precision-grid__section precision-grid__section--surface precision-grid__section--illustrated"
        >
          <SectionMotifSVG variant="roadmap" />
          <div className="page-container">
            <SectionReveal className="stack stack--xl" staggerChildren>
              <div data-reveal data-reveal-wide className="section-header">
                <p className="eyebrow">Roadmap</p>
                <h2 id="roadmap-heading" className="type-h2-marketing text-ink">
                  What comes next
                </h2>
                <p className="type-body section-header__description">
                  v1 establishes the core pipeline. Next: more ways for customers to reach you,
                  smarter deflection, and operator tools that keep the queue moving.
                </p>
              </div>
              <div className="roadmap-grid">
                {ROADMAP_ITEMS.map(({ eyebrow, title, body }) => (
                  <article key={title} data-reveal className="roadmap-cell stack stack--sm">
                    <p className="eyebrow">{eyebrow}</p>
                    <h3 className="type-h3 text-ink">{title}</h3>
                    <p className="type-body text-ink-muted">{body}</p>
                  </article>
                ))}
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* Feedback */}
        <section
          id="feedback"
          aria-labelledby="feedback-heading"
          className="section-anchor precision-grid__section precision-grid__section--canvas precision-grid__section--illustrated"
        >
          <SectionMotifSVG variant="feedback" />
          <div className="page-container">
            <div className="split">
              <SectionReveal variant="fade-wide">
                <div className="section-header">
                  <p className="eyebrow">Feedback</p>
                  <h2 id="feedback-heading" className="type-h2-marketing text-ink">
                    Help shape the product
                  </h2>
                  <p className="type-body section-header__description">
                    Request a feature, integration, or workflow. Feedback is submitted as a ticket —
                    the same intake flow your customers will use.
                  </p>
                </div>
              </SectionReveal>
              <SectionReveal staggerIndex={1}>
                <FeedbackForm />
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* §4 CTA band */}
        <section
          ref={ctaSectionRef}
          className="precision-grid__section precision-grid__section--cta precision-grid__section--illustrated"
        >
          <SectionMotifSVG variant="cta" />
          <div className="page-container">
            <div data-cta-enter className="stack stack--lg mx-auto max-w-xl text-center">
              <h2 className="type-h2-marketing text-ink">Get early access to Triage.</h2>
              <EarlyAccessButton waitlistFormId={waitlistFormId} className="mx-auto" />
              <p className="type-body text-ink-muted">
                We are onboarding SMB and agency teams in batches.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketing-footer precision-grid__section--canvas">
        <div className="page-container marketing-footer__grid type-small text-ink-faint">
          <div className="stack stack--sm">
            <p className="type-body font-semibold text-ink" translate="no">
              Triage
            </p>
            <p>
              AI-assisted support ticketing for teams and agencies — web intake, automated triage,
              operator queue, and customer status links.
            </p>
          </div>
          <nav aria-label="Footer links" className="stack stack--sm">
            <p className="eyebrow">Links</p>
            <EarlyAccessButton
              waitlistFormId={waitlistFormId}
              variant="ghost"
              className="marketing-link w-fit px-0 text-ink-faint hover:text-ink"
            />
            <Link to="/submit" className="marketing-link w-fit text-ink-faint hover:text-ink">
              Preview submit flow
            </Link>
            <Link
              to="/operator"
              search={defaultOperatorSearch}
              className="marketing-link w-fit text-ink-faint hover:text-ink"
            >
              Operator console
            </Link>
            <a href="#roadmap" className="marketing-link w-fit text-ink-faint hover:text-ink">
              Roadmap
            </a>
            <a href="#feedback" className="marketing-link w-fit text-ink-faint hover:text-ink">
              Feedback
            </a>
          </nav>
          <div className="stack stack--sm">
            <p className="eyebrow">Legal</p>
            <p className="type-small text-ink-faint">Privacy — coming soon</p>
            <p className="type-small text-ink-faint">Terms — coming soon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
