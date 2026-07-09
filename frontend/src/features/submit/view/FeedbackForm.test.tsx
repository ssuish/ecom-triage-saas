import { test, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

vi.mock("@/features/submit/controller/queries", () => ({
  useCreateTicket: vi.fn(),
}));

import { useCreateTicket } from "@/features/submit/controller/queries";
import { FeedbackForm } from "./FeedbackForm";

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
  renderWithProviders(<FeedbackForm />);

  fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

  expect(await screen.findByText("Name is required.")).toBeInTheDocument();
  expect(screen.getByText("Email is required.")).toBeInTheDocument();
  expect(screen.getByText(/share your feedback/i)).toBeInTheDocument();
});

test("submits feedback successfully", async () => {
  const mutateAsync = vi.fn().mockResolvedValue({ id: "t1" });
  vi.mocked(useCreateTicket).mockReturnValue(mockMutation({ mutateAsync }));
  renderWithProviders(<FeedbackForm />);

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Alex" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "alex@example.com" } });
  fireEvent.change(screen.getByLabelText(/suggestion/i), { target: { value: "Add Slack intake." } });
  fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

  await waitFor(() => {
    expect(mutateAsync).toHaveBeenCalledWith({
      customer_name: "Alex",
      customer_email: "alex@example.com",
      subject: "Product Feedback",
      body: "Add Slack intake.",
    });
    expect(screen.getByText(/feedback received/i)).toBeInTheDocument();
  });
});

test("shows submit error from mutation", async () => {
  vi.mocked(useCreateTicket).mockReturnValue(
    mockMutation({
      mutateAsync: vi.fn().mockRejectedValue(new Error("Rate limited")),
      error: new Error("Rate limited"),
    }),
  );
  renderWithProviders(<FeedbackForm />);

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Alex" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "alex@example.com" } });
  fireEvent.change(screen.getByLabelText(/suggestion/i), { target: { value: "Add Slack intake." } });
  fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

  expect(await screen.findByText("Rate limited")).toBeInTheDocument();
});

test("registers beforeunload when form is dirty", async () => {
  vi.mocked(useCreateTicket).mockReturnValue(mockMutation());
  const addSpy = vi.spyOn(window, "addEventListener");
  renderWithProviders(<FeedbackForm />);

  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Alex" } });

  expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  addSpy.mockRestore();
});
