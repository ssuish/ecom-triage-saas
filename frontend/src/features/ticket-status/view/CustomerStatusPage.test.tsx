import { test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

vi.mock("@/features/ticket-status/controller/queries", () => ({
  useTicketStatus: vi.fn(),
}));

vi.mock("@/shared/components/MarketingPageChrome", () => ({
  MarketingPageChrome: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { useTicketStatus } from "@/features/ticket-status/controller/queries";
import { CustomerStatusPage } from "./CustomerStatusPage";

beforeEach(() => {
  vi.clearAllMocks();
});

test("shows loading state initially", () => {
  vi.mocked(useTicketStatus).mockReturnValue({
    data: undefined,
    isLoading: true,
    error: null,
  } as ReturnType<typeof useTicketStatus>);
  renderWithProviders(<CustomerStatusPage ticketId="ticket-123" token="tok" />);
  expect(screen.getByTestId("status-card-skeleton")).toBeInTheDocument();
  expect(screen.getByRole("status", { name: /loading your ticket/i })).toBeInTheDocument();
});

test("displays ticket subject and status after load", async () => {
  vi.mocked(useTicketStatus).mockReturnValue({
    data: {
      id: "ticket-123",
      subject: "My billing question",
      status: "open",
      agent_reply: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTicketStatus>);

  renderWithProviders(<CustomerStatusPage ticketId="ticket-123" token="tok" />);

  await waitFor(() => {
    expect(screen.getByText("My billing question")).toBeInTheDocument();
    expect(screen.getByText(/open/i)).toBeInTheDocument();
  });
});

test("shows agent reply when resolved", async () => {
  vi.mocked(useTicketStatus).mockReturnValue({
    data: {
      id: "ticket-123",
      subject: "My question",
      status: "resolved",
      agent_reply: "We resolved your issue.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTicketStatus>);

  renderWithProviders(<CustomerStatusPage ticketId="ticket-123" token="tok" />);

  await waitFor(() => {
    expect(screen.getByText("We resolved your issue.")).toBeInTheDocument();
  });
});

test("shows resolved message when reply is not yet available", async () => {
  vi.mocked(useTicketStatus).mockReturnValue({
    data: {
      id: "ticket-123",
      subject: "My question",
      status: "resolved",
      agent_reply: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTicketStatus>);

  renderWithProviders(<CustomerStatusPage ticketId="ticket-123" token="tok" />);

  await waitFor(() => {
    expect(screen.getByText(/your ticket has been resolved/i)).toBeInTheDocument();
  });
});

test("shows error state on invalid token", async () => {
  vi.mocked(useTicketStatus).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: new Error("Not found"),
  } as ReturnType<typeof useTicketStatus>);

  renderWithProviders(<CustomerStatusPage ticketId="ticket-123" token="bad-token" />);

  await waitFor(() => {
    expect(screen.getByText(/invalid.*link|not found/i)).toBeInTheDocument();
  });
});
