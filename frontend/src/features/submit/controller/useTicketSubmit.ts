import { useEffect, useRef, useState } from "react";
import { firstErrorField, isSubmitDirty, validateSubmit } from "../model/schema";
import type { SubmitErrors, SubmitField, SubmitFieldIds, SubmitValues } from "../model/types";
import { useCreateTicket } from "./queries";

const EMPTY_VALUES: SubmitValues = {
  customer_name: "",
  customer_email: "",
  subject: "",
  body: "",
};

export interface TicketSubmission {
  ticketId: string;
  magicToken: string;
  statusHref: string;
}

export interface UseTicketSubmitOptions {
  fields: SubmitField[];
  fieldIds: SubmitFieldIds;
  errorIds: SubmitFieldIds;
  requireSubject?: boolean;
  fixedSubject?: string;
  bodyRequiredMessage?: string;
}

export function useTicketSubmit({
  fields,
  fieldIds,
  errorIds,
  requireSubject = true,
  fixedSubject,
  bodyRequiredMessage,
}: UseTicketSubmitOptions) {
  const [values, setValues] = useState<SubmitValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [submission, setSubmission] = useState<TicketSubmission | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const createTicket = useCreateTicket();

  const submitted = submission !== null;

  useEffect(() => {
    if (submission || !isSubmitDirty(values, fields)) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [values, submission, fields]);

  useEffect(() => {
    if (!submission) return;
    statusRef.current?.focus();
  }, [submission]);

  const set =
    (field: SubmitField) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateSubmit(values, { requireSubject, bodyRequiredMessage });
    setErrors(nextErrors);
    const firstError = firstErrorField(nextErrors, fields);
    if (firstError) {
      document.getElementById(fieldIds[firstError])?.focus();
      return;
    }

    try {
      const ticket = await createTicket.mutateAsync({
        customer_name: values.customer_name.trim(),
        customer_email: values.customer_email.trim(),
        subject: (fixedSubject ?? values.subject).trim(),
        body: values.body.trim(),
      });
      setSubmission({
        ticketId: ticket.id,
        magicToken: ticket.magic_token,
        statusHref: `/ticket/${ticket.id}?token=${encodeURIComponent(ticket.magic_token)}`,
      });
    } catch {
      // mutation error surfaced via createTicket.error
    }
  };

  return {
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
  };
}
