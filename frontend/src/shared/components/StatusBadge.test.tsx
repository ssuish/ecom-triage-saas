import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

test("renders open status with correct label", () => {
  render(<StatusBadge value="open" type="status" />);
  expect(screen.getByText("OPEN")).toBeInTheDocument();
});

test("unknown status uses open fallback styling class", () => {
  const { container } = render(<StatusBadge value="unknown" type="status" />);
  expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  expect(container.querySelector(".badge--open")).toBeInTheDocument();
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

test("aiProvenance adds ai-badge class on category and priority", () => {
  const { container, rerender } = render(
    <StatusBadge value="billing" type="category" aiProvenance />,
  );
  expect(container.querySelector(".badge .ai-badge")).toBeInTheDocument();

  rerender(<StatusBadge value="high" type="priority" aiProvenance />);
  expect(container.querySelector(".badge .ai-badge")).toBeInTheDocument();

  rerender(<StatusBadge value="open" type="status" aiProvenance />);
  expect(container.querySelector(".badge .ai-badge")).not.toBeInTheDocument();
});
