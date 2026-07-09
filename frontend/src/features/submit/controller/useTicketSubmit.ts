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
  const [submitted, setSubmitted] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const createTicket = useCreateTicket();

  useEffect(() => {
    if (submitted || !isSubmitDirty(values, fields)) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [values, submitted, fields]);

  useEffect(() => {
    if (!submitted) return;
    statusRef.current?.focus();
  }, [submitted]);

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
      await createTicket.mutateAsync({
        customer_name: values.customer_name.trim(),
        customer_email: values.customer_email.trim(),
        subject: (fixedSubject ?? values.subject).trim(),
        body: values.body.trim(),
      });
      setSubmitted(true);
    } catch {
      // mutation error surfaced via createTicket.error
    }
  };

  return {
    values,
    errors,
    submitted,
    statusRef,
    createTicket,
    set,
    handleSubmit,
    fieldIds,
    errorIds,
  };
}
