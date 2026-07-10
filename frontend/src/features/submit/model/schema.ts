import type { SubmitErrors, SubmitField, SubmitValues } from "./types";

const MAX_NAME_LENGTH = 255;
const MAX_SUBJECT_LENGTH = 500;
const MAX_BODY_LENGTH = 10_000;

export interface ValidateSubmitOptions {
  requireSubject?: boolean;
  bodyRequiredMessage?: string;
}

export function validateSubmit(
  values: SubmitValues,
  options: ValidateSubmitOptions = {},
): SubmitErrors {
  const { requireSubject = true, bodyRequiredMessage = "Describe your issue before submitting." } =
    options;
  const errors: SubmitErrors = {};

  if (!values.customer_name.trim()) {
    errors.customer_name = "Name is required.";
  } else if (values.customer_name.trim().length > MAX_NAME_LENGTH) {
    errors.customer_name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }
  if (!values.customer_email.trim()) {
    errors.customer_email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email)) {
    errors.customer_email = "Enter a valid address like hello@example.com.";
  }
  if (requireSubject && !values.subject.trim()) {
    errors.subject = "Subject is required.";
  } else if (requireSubject && values.subject.trim().length > MAX_SUBJECT_LENGTH) {
    errors.subject = `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`;
  }
  if (!values.body.trim()) {
    errors.body = bodyRequiredMessage;
  } else if (values.body.trim().length > MAX_BODY_LENGTH) {
    errors.body = `Message must be ${MAX_BODY_LENGTH} characters or fewer.`;
  }

  return errors;
}

export function firstErrorField(
  errors: SubmitErrors,
  fieldOrder: SubmitField[],
): SubmitField | null {
  return fieldOrder.find((field) => errors[field]) ?? null;
}

export function isSubmitDirty(values: SubmitValues, fields: SubmitField[]): boolean {
  return fields.some((field) => values[field].trim().length > 0);
}
