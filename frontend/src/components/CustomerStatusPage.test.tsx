import { test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/api", () => ({
  getTicketStatus: vi.fn(),
}));

import { getTicketStatus } from "@/api";
import { CustomerStatusPage } from "./CustomerStatusPage";

beforeEach(() => {
  vi.clearAllMocks();
});

test("shows loading state initially", () => {
  vi.mocked(getTicketStatus).mockReturnValue(new Promise(() => {}));
  render(<CustomerStatusPage ticketId="ticket-123" token="tok" />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("displays ticket subject and status after load", async () => {
  vi.mocked(getTicketStatus).mockResolvedValue({
    id: "ticket-123",
    subject: "My billing question",
    status: "open",
    agent_reply: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  render(<CustomerStatusPage ticketId="ticket-123" token="tok" />);

  await waitFor(() => {
    expect(screen.getByText("My billing question")).toBeInTheDocument();
    expect(screen.getByText(/open/i)).toBeInTheDocument();
  });
});

test("shows agent reply when resolved", async () => {
  vi.mocked(getTicketStatus).mockResolvedValue({
    id: "ticket-123",
    subject: "My question",
    status: "resolved",
    agent_reply: "We resolved your issue.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  render(<CustomerStatusPage ticketId="ticket-123" token="tok" />);

  await waitFor(() => {
    expect(screen.getByText("We resolved your issue.")).toBeInTheDocument();
  });
});

test("shows error state on invalid token", async () => {
  vi.mocked(getTicketStatus).mockRejectedValue(new Error("Not found"));

  render(<CustomerStatusPage ticketId="ticket-123" token="bad-token" />);

  await waitFor(() => {
    expect(screen.getByText(/invalid.*link|not found/i)).toBeInTheDocument();
  });
});
