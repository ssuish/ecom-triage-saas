import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useTicketSubmit } from "../controller/useTicketSubmit";
import type { SubmitFieldIds } from "../model/types";

const FIELD_IDS: SubmitFieldIds = {
  customer_name: "customer_name",
  customer_email: "customer_email",
  subject: "feedback_subject",
  body: "feedback_body",
};

const ERROR_IDS: SubmitFieldIds = {
  customer_name: "customer_name_error",
  customer_email: "customer_email_error",
  subject: "feedback_subject_error",
  body: "feedback_body_error",
};

const FIELD_ORDER = ["customer_name", "customer_email", "body"] as const;

export function FeedbackForm() {
  const {
    values,
    errors,
    submitted,
    statusRef,
    createTicket,
    set,
    handleSubmit,
    fieldIds,
    errorIds,
  } = useTicketSubmit({
    fields: [...FIELD_ORDER],
    fieldIds: FIELD_IDS,
    errorIds: ERROR_IDS,
    requireSubject: false,
    fixedSubject: "Product Feedback",
    bodyRequiredMessage: "Share your feedback before submitting.",
  });

  if (submitted) {
    return (
      <div className="card stack stack--sm max-w-xl page-enter">
        <h3 className="type-h3 text-[color:var(--status-success)]">Feedback received</h3>
        <p className="type-body text-ink-muted">
          Thanks for helping shape Triage. We read every suggestion.
        </p>
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className="type-small text-ink-muted focus-visible-success outline-none"
        >
          Your review was submitted as a ticket so our team can follow up if needed.
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-xl">
      <div className="stack stack--lg">
        <div className="stack stack--sm">
          <h3 className="type-h3 text-ink">Share your review</h3>
          <p className="type-body text-ink-muted">
            Tell us what you need from AI support tooling — suggestions go straight to the team.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="stack stack--sm"
          noValidate
          aria-busy={createTicket.isPending}
        >
          <div className="stack stack--sm">
            <label htmlFor={fieldIds.customer_name} className="type-body font-medium text-ink">
              Name
            </label>
            <Input
              id={fieldIds.customer_name}
              name="customer_name"
              autoComplete="name"
              value={values.customer_name}
              onChange={set("customer_name")}
              placeholder="Your name…"
              aria-invalid={Boolean(errors.customer_name)}
              aria-describedby={errors.customer_name ? errorIds.customer_name : undefined}
              spellCheck={false}
              disabled={createTicket.isPending}
            />
            {errors.customer_name && (
              <p id={errorIds.customer_name} className="type-small text-destructive">
                {errors.customer_name}
              </p>
            )}
          </div>

          <div className="stack stack--sm">
            <label htmlFor={fieldIds.customer_email} className="type-body font-medium text-ink">
              Email
            </label>
            <Input
              id={fieldIds.customer_email}
              name="customer_email"
              type="email"
              autoComplete="email"
              value={values.customer_email}
              onChange={set("customer_email")}
              placeholder="you@example.com…"
              aria-invalid={Boolean(errors.customer_email)}
              aria-describedby={errors.customer_email ? errorIds.customer_email : undefined}
              spellCheck={false}
              disabled={createTicket.isPending}
            />
            {errors.customer_email && (
              <p id={errorIds.customer_email} className="type-small text-destructive">
                {errors.customer_email}
              </p>
            )}
          </div>

          <div className="stack stack--sm">
            <label htmlFor={fieldIds.body} className="type-body font-medium text-ink">
              Suggestion
            </label>
            <Textarea
              id={fieldIds.body}
              name="feedback_body"
              autoComplete="off"
              value={values.body}
              onChange={set("body")}
              rows={4}
              placeholder="What would make Triage useful for your team…"
              aria-invalid={Boolean(errors.body)}
              aria-describedby={errors.body ? errorIds.body : undefined}
              disabled={createTicket.isPending}
            />
            {errors.body && (
              <p id={errorIds.body} className="type-small text-destructive">
                {errors.body}
              </p>
            )}
          </div>

          {createTicket.error && (
            <p className="type-body text-destructive" role="alert">
              {createTicket.error instanceof Error
                ? createTicket.error.message
                : "Submission failed."}
            </p>
          )}

          <Button
            type="submit"
            size="marketing"
            className="touch-target"
            disabled={createTicket.isPending}
            aria-busy={createTicket.isPending}
          >
            {createTicket.isPending ? "Sending…" : "Send feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}
