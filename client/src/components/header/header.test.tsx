import { afterEach, describe, expect, it, vi } from "vitest";
import { Header, HEADER_TEXT } from "./header.tsx";
import { cleanup, fireEvent, render } from "@testing-library/react";

describe("header", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders", () => {
    const { getByText } = render(<Header />);
    expect(getByText(HEADER_TEXT)).toBeTruthy();
  });

  it("opens add insight modal when button is clicked", () => {
    const { getByText } = render(<Header />);

    const addButton = getByText("Add insight");
    fireEvent.click(addButton);

    // Check if the modal content is visible
    expect(getByText("Add a new insight")).toBeTruthy();
  });

  it("calls onInsightAdded callback when provided", () => {
    const mockCallback = vi.fn();
    const { getByText } = render(<Header onInsightAdded={mockCallback} />);

    expect(getByText(HEADER_TEXT)).toBeTruthy();
  });
});
