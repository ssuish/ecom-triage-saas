import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useTicketSubmit } from "../controller/useTicketSubmit";
import type { SubmitFieldIds } from "../model/types";

const FIELD_IDS: SubmitFieldIds = {
  customer_name: "submit_customer_name",
  customer_email: "submit_customer_email",
  subject: "submit_subject",
  body: "submit_body",
};

const FIELD_ORDER = ["customer_name", "customer_email", "subject", "body"] as const;

export function TicketSubmitForm() {
  const {
    values,
    errors,
    submitted,
    submission,
    statusRef,
    createTicket,
    set,
    handleSubmit,
    fieldIds,
    errorIds,
  } = useTicketSubmit({
    fields: [...FIELD_ORDER],
    fieldIds: FIELD_IDS,
    errorIds: FIELD_IDS,
  });

  if (submitted && submission) {
    return (
      <div className="card stack stack--sm max-w-xl page-enter">
        <h1 className="type-h1 text-[color:var(--status-success)]">Ticket submitted</h1>
        <p className="type-body text-ink-muted">
          We received your request and sent a confirmation email with a link to track status.
        </p>
        <div
          ref={statusRef}
          tabIndex={-1}
          role="status"
          className="stack stack--xs focus-visible-success outline-none"
        >
          <p className="type-small text-ink-muted">
            Save this link to check your ticket later — no account required.
          </p>
          <a
            href={submission.statusHref}
            className="marketing-link type-body text-ink underline-offset-4 hover:underline break-all"
          >
            {submission.statusHref}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card stack stack--lg max-w-xl"
      noValidate
      aria-busy={createTicket.isPending}
    >
      <div className="stack stack--sm">
        <h1 className="type-h1 text-ink">Submit a ticket</h1>
        <p className="type-body text-ink-muted">
          No account required. We&apos;ll email you a link to track your request.
        </p>
      </div>

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
        <label htmlFor={fieldIds.subject} className="type-body font-medium text-ink">
          Subject
        </label>
        <Input
          id={fieldIds.subject}
          name="subject"
          autoComplete="off"
          value={values.subject}
          onChange={set("subject")}
          placeholder="Brief summary of your issue…"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? errorIds.subject : undefined}
          disabled={createTicket.isPending}
        />
        {errors.subject && (
          <p id={errorIds.subject} className="type-small text-destructive">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="stack stack--sm">
        <label htmlFor={fieldIds.body} className="type-body font-medium text-ink">
          Message
        </label>
        <Textarea
          id={fieldIds.body}
          name="body"
          autoComplete="off"
          value={values.body}
          onChange={set("body")}
          rows={6}
          placeholder="Describe what happened and what you need…"
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
          {createTicket.error instanceof Error ? createTicket.error.message : "Submission failed."}
        </p>
      )}

      <Button
        type="submit"
        size="marketing"
        className="touch-target w-fit"
        disabled={createTicket.isPending}
        aria-busy={createTicket.isPending}
      >
        {createTicket.isPending ? "Submitting…" : "Submit ticket"}
      </Button>
    </form>
  );
}
