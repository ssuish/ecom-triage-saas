import { test, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

vi.mock("@/features/submit/controller/queries", () => ({
  useCreateTicket: vi.fn(),
}));

import { useCreateTicket } from "@/features/submit/controller/queries";
import { TicketSubmitForm } from "./TicketSubmitForm";

beforeEach(() => {
  vi.clearAllMocks();
});

function mockMutation(overrides: Partial<ReturnType<typeof useCreateTicket>> = {}) {
  return {
    mutateAsync: vi.fn().mockResolvedValue({ id: "t1" }),
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
  const mutateAsync = vi.fn().mockResolvedValue({ id: "t1" });
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
