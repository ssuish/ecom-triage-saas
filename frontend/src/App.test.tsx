import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

vi.mock("@/api", () => ({
  getTicketStatus: vi.fn(),
}));

import { getTicketStatus } from "@/api";

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders home page on root path", () => {
  window.history.pushState({}, "", "/");
  render(<App />);
  expect(screen.getByRole("heading", { name: /triage support/i })).toBeInTheDocument();
});

test("renders customer status page for magic link path", async () => {
  window.history.pushState({}, "", "/ticket/ticket-123?token=magic-tok");
  vi.mocked(getTicketStatus).mockResolvedValue({
    id: "ticket-123",
    subject: "Where is my order?",
    status: "open",
    agent_reply: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Where is my order?")).toBeInTheDocument();
  });
});
