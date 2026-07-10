import { test, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import type { Agent, Ticket } from "@/shared/api/tickets";

const ticket: Ticket = {
  id: "t1",
  subject: "Broken checkout",
  body: "Payment fails.",
  source: "form",
  status: "open",
  priority: "high",
  category: "billing",
  escalate: false,
  ai_draft_reply: "Thanks for reaching out.",
  agent_reply: null,
  assigned_agent_id: null,
  customer_email: "alex@example.com",
  customer_name: "Alex",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const agents: Agent[] = [{ id: "a1", email: "agent@example.com", name: "Agent One" }];

const mutateResolve = vi.fn();
const mutateSaveReply = vi.fn();

vi.mock("../controller/queries", () => ({
  useTicketDetail: vi.fn(),
  useSaveReply: vi.fn(),
  useResolveTicket: vi.fn(),
  useAssignTicket: vi.fn(),
}));

import {
  useAssignTicket,
  useResolveTicket,
  useSaveReply,
  useTicketDetail,
} from "../controller/queries";
import { TicketDetailPanel } from "./TicketDetailPanel";

beforeEach(() => {
  vi.clearAllMocks();
  mutateResolve.mockReset();
  mutateSaveReply.mockReset();

  vi.mocked(useTicketDetail).mockReturnValue({
    data: ticket,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useTicketDetail>);

  vi.mocked(useSaveReply).mockReturnValue({
    mutate: mutateSaveReply,
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useSaveReply>);

  vi.mocked(useResolveTicket).mockReturnValue({
    mutate: mutateResolve,
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useResolveTicket>);

  vi.mocked(useAssignTicket).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useAssignTicket>);
});

test("save reply sends trimmed draft", async () => {
  renderWithProviders(
    <TicketDetailPanel ticketId="t1" token="jwt" authUserId="user_1" agents={agents} />,
  );

  const reply = screen.getByLabelText(/reply to customer/i);
  fireEvent.change(reply, { target: { value: "  Updated reply.  " } });
  fireEvent.click(screen.getByRole("button", { name: /save reply/i }));

  await waitFor(() => {
    expect(mutateSaveReply).toHaveBeenCalledWith({
      id: "t1",
      agentReply: "Updated reply.",
      token: "jwt",
    });
  });
});

test("resolve sends trimmed draft for persistence", async () => {
  renderWithProviders(
    <TicketDetailPanel ticketId="t1" token="jwt" authUserId="user_1" agents={agents} />,
  );

  const reply = screen.getByLabelText(/reply to customer/i);
  fireEvent.change(reply, { target: { value: "Final reply." } });
  fireEvent.click(screen.getByRole("button", { name: /resolve ticket/i }));

  await waitFor(() => {
    expect(mutateResolve).toHaveBeenCalledWith({
      id: "t1",
      token: "jwt",
      agentReply: "Final reply.",
    });
  });
});

test("shows category badge", () => {
  const { container } = renderWithProviders(
    <TicketDetailPanel ticketId="t1" token="jwt" authUserId="user_1" agents={agents} />,
  );

  expect(screen.getByText("BILLING")).toBeInTheDocument();
  const aiBadges = container.querySelectorAll(".ai-badge");
  expect(aiBadges.length).toBeGreaterThanOrEqual(2);
});
