import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

test("renders heading", () => {
  vi.mocked(fetch).mockResolvedValue({
    json: () => Promise.resolve({ status: "ok" }),
  } as Response);
  render(<App />);
  expect(screen.getByRole("heading", { name: /serverless-fastapi/i })).toBeInTheDocument();
});

test("shows loading state before fetch resolves", () => {
  vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test("shows API status after fetch resolves", async () => {
  vi.mocked(fetch).mockResolvedValue({
    json: () => Promise.resolve({ status: "ok" }),
  } as Response);
  render(<App />);
  await waitFor(() => expect(screen.getByText(/API status: ok/i)).toBeInTheDocument());
});
