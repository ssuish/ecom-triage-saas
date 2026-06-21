import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

test("renders open status with correct label", () => {
  render(<StatusBadge value="open" type="status" />);
  expect(screen.getByText("OPEN")).toBeInTheDocument();
});

test("renders high priority with correct label", () => {
  render(<StatusBadge value="high" type="priority" />);
  expect(screen.getByText("HIGH")).toBeInTheDocument();
});

test("escalation badge renders when true", () => {
  render(<StatusBadge value={true} type="escalate" />);
  expect(screen.getByText(/escalat/i)).toBeInTheDocument();
});

test("escalation badge not rendered when false", () => {
  const { container } = render(<StatusBadge value={false} type="escalate" />);
  expect(container.firstChild).toBeNull();
});
