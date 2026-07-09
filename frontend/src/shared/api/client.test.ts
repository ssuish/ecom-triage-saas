import { describe, test, expect } from "vitest";
import { errorDetail } from "./client";

describe("errorDetail", () => {
  test("returns string detail from API errors", () => {
    expect(errorDetail({ detail: "Not found" }, 404)).toBe("Not found");
  });

  test("formats FastAPI validation error arrays", () => {
    expect(
      errorDetail(
        {
          detail: [
            { type: "string_too_long", loc: ["body", "subject"], msg: "String should have at most 500 characters" },
            { type: "value_error", loc: ["body", "customer_email"], msg: "value is not a valid email address" },
          ],
        },
        422,
      ),
    ).toBe(
      "String should have at most 500 characters value is not a valid email address",
    );
  });

  test("falls back to HTTP status", () => {
    expect(errorDetail(null, 500)).toBe("HTTP 500");
  });
});
