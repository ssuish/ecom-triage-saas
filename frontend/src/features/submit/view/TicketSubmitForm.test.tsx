import { test, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

vi.mock("@/features/submit/controller/queries", () => ({
  useCreateTicket: vi.fn(),
}));

import { useCreateTicket } from "@/features/submit/controller/queries";
import type { TicketCreateResult } from "@/shared/api/tickets";
import { TicketSubmitForm } from "./TicketSubmitForm";

beforeEach(() => {
  vi.clearAllMocks();
});

const createTicketResult: TicketCreateResult = {
  id: "t1",
  subject: "Broken checkout",
  body: "Payment fails on submit.",
  source: "form",
  status: "open",
  priority: "medium",
  category: "other",
  escalate: false,
  ai_draft_reply: null,
  agent_reply: null,
  assigned_agent_id: null,
  customer_email: "alex@example.com",
  customer_name: "Alex",
  created_at: "2026-07-10T00:00:00Z",
  updated_at: "2026-07-10T00:00:00Z",
  magic_token: "tok-123",
};

function mockMutation(overrides: Partial<ReturnType<typeof useCreateTicket>> = {}) {
  return {
    mutateAsync: vi.fn().mockResolvedValue(createTicketResult),
    isPending: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useCreateTicket>;
}

test("shows validation errors when fields are empty", async () => {
  vi.mocked(useCreateTicket).mockReturnValue(mockMutation());
  renderWithProviders(<TicketSubmitForm />);

  fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

  expect(await screen.findByText("Name is required.")).toBeInTheDocument();
  expect(screen.getByText("Email is required.")).toBeInTheDocument();
  expect(screen.getByText("Subject is required.")).toBeInTheDocument();
  expect(screen.getByText(/describe your issue/i)).toBeInTheDocument();
});

test("submits ticket successfully", async () => {
  const mutateAsync = vi.fn().mockResolvedValue(createTicketResult);
  vi.mocked(useCreateTicket).mockReturnValue(mockMutation({ mutateAsync }));
  renderWithProviders(<TicketSubmitForm />);

  fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Alex" } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "alex@example.com" } });
  fireEvent.change(screen.getByLabelText(/^subject$/i), { target: { value: "Broken checkout" } });
  fireEvent.change(screen.getByLabelText(/^message$/i), {
    target: { value: "Payment fails on submit." },
  });
  fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledWith({
      customer_name: "Alex",
      customer_email: "alex@example.com",
      subject: "Broken checkout",
      body: "Payment fails on submit.",
    });
    expect(screen.getByText(/ticket submitted/i)).toBeInTheDocument();
  });

  const link = await screen.findByRole("link", { name: /\/ticket\/t1\?token=tok-123/i });
  expect(link.getAttribute("href")).toBe("/ticket/t1?token=tok-123");
});

test("shows submit error from mutation", async () => {
  vi.mocked(useCreateTicket).mockReturnValue(
    mockMutation({
      mutateAsync: vi.fn().mockRejectedValue(new Error("Rate limited")),
      error: new Error("Rate limited"),
    }),
  );
  renderWithProviders(<TicketSubmitForm />);

  fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Alex" } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "alex@example.com" } });
  fireEvent.change(screen.getByLabelText(/^subject$/i), { target: { value: "Broken checkout" } });
  fireEvent.change(screen.getByLabelText(/^message$/i), {
    target: { value: "Payment fails on submit." },
  });
  fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

  expect(await screen.findByText("Rate limited")).toBeInTheDocument();
});
