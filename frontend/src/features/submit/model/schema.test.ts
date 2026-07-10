import { describe, test, expect } from "vitest";
import { firstErrorField, isSubmitDirty, validateSubmit } from "./schema";
import type { SubmitValues } from "./types";

const validValues: SubmitValues = {
  customer_name: "Alex",
  customer_email: "alex@example.com",
  subject: "Broken checkout",
  body: "Payment fails on submit.",
};

describe("validateSubmit", () => {
  test("returns no errors for valid values", () => {
    expect(validateSubmit(validValues)).toEqual({});
  });

  test("requires name, email, subject, and body", () => {
    const errors = validateSubmit({
      customer_name: "",
      customer_email: "",
      subject: "",
      body: "",
    });
    expect(errors.customer_name).toBe("Name is required.");
    expect(errors.customer_email).toBe("Email is required.");
    expect(errors.subject).toBe("Subject is required.");
    expect(errors.body).toBe("Describe your issue before submitting.");
  });

  test("rejects invalid email", () => {
    const errors = validateSubmit({ ...validValues, customer_email: "not-an-email" });
    expect(errors.customer_email).toMatch(/valid address/i);
  });

  test("enforces max lengths", () => {
    const errors = validateSubmit({
      ...validValues,
      customer_name: "a".repeat(256),
      subject: "s".repeat(501),
      body: "b".repeat(10_001),
    });
    expect(errors.customer_name).toMatch(/255/);
    expect(errors.subject).toMatch(/500/);
    expect(errors.body).toMatch(/10000/);
  });

  test("skips subject when requireSubject is false", () => {
    const errors = validateSubmit(
      { ...validValues, subject: "" },
      { requireSubject: false },
    );
    expect(errors.subject).toBeUndefined();
  });
});

describe("firstErrorField", () => {
  test("returns first field with an error in order", () => {
    const errors = validateSubmit({
      customer_name: "",
      customer_email: "",
      subject: "",
      body: "",
    });
    expect(firstErrorField(errors, ["customer_name", "customer_email", "subject", "body"])).toBe(
      "customer_name",
    );
  });
});

describe("isSubmitDirty", () => {
  test("is false for empty values", () => {
    expect(
      isSubmitDirty(
        { customer_name: "", customer_email: "", subject: "", body: "" },
        ["customer_name", "body"],
      ),
    ).toBe(false);
  });

  test("is true when any tracked field has content", () => {
    expect(
      isSubmitDirty(
        { customer_name: "Alex", customer_email: "", subject: "", body: "" },
        ["customer_name", "body"],
      ),
    ).toBe(true);
  });
});
