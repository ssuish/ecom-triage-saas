export interface SubmitValues {
  customer_name: string;
  customer_email: string;
  subject: string;
  body: string;
}

export type SubmitField = keyof SubmitValues;

export interface SubmitErrors {
  customer_name?: string;
  customer_email?: string;
  subject?: string;
  body?: string;
}

export interface SubmitFieldIds {
  customer_name: string;
  customer_email: string;
  subject: string;
  body: string;
}
