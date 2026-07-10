import { describe, test, expect } from "vitest";
import { validateOperatorSearch } from "@/features/operator";
import { validateTicketSearch } from "@/features/ticket-status";

describe("validateOperatorSearch", () => {
  test("returns defaults for empty search", () => {
    expect(validateOperatorSearch({})).toEqual({
      status: undefined,
      priority: undefined,
      category: undefined,
      page: 1,
      ticketId: undefined,
    });
  });

  test("parses string filters and ticket id", () => {
    expect(
      validateOperatorSearch({
        status: "open",
        priority: "high",
        category: "billing",
        ticketId: "abc-123",
      }),
    ).toEqual({
      status: "open",
      priority: "high",
      category: "billing",
      page: 1,
      ticketId: "abc-123",
    });
  });

  test("coerces page from string", () => {
    expect(validateOperatorSearch({ page: "3" })).toMatchObject({ page: 3 });
    expect(validateOperatorSearch({ page: "bad" })).toMatchObject({ page: 1 });
  });
});

describe("ticket route search", () => {
  test("validateTicketSearch keeps token string and defaults missing token", () => {
    expect(validateTicketSearch({ token: "abc" })).toEqual({ token: "abc" });
    expect(validateTicketSearch({})).toEqual({ token: "" });
    expect(validateTicketSearch({ token: 123 })).toEqual({ token: "" });
  });
});
