import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AddInsight } from "./add-insight.tsx";

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("AddInsight", () => {
  const mockOnClose = vi.fn();
  const mockOnInsightAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form elements correctly", () => {
    render(
      <AddInsight
        open
        onClose={mockOnClose}
        onInsightAdded={mockOnInsightAdded}
      />,
    );

    expect(screen.getByText("Add a new insight")).toBeTruthy();
    expect(screen.getByLabelText("Brand")).toBeTruthy();
    expect(screen.getByLabelText("Insight")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add insight" })).toBeTruthy();
  });

  it("shows error when submitting empty insight", async () => {
    render(
      <AddInsight
        open
        onClose={mockOnClose}
        onInsightAdded={mockOnInsightAdded}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Add insight" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter an insight")).toBeTruthy();
    });
  });

  it("submits form with valid data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => ({ success: true }),
    });

    render(
      <AddInsight
        open
        onClose={mockOnClose}
        onInsightAdded={mockOnInsightAdded}
      />,
    );

    const textArea = screen.getByLabelText("Insight");
    const submitButton = screen.getByRole("button", { name: "Add insight" });

    fireEvent.change(textArea, { target: { value: "Test insight" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/insights/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: 1, // Default brand
          text: "Test insight",
        }),
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnInsightAdded).toHaveBeenCalled();
  });

  it("handles API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => ({ error: "Server error" }),
    });

    render(
      <AddInsight
        open
        onClose={mockOnClose}
        onInsightAdded={mockOnInsightAdded}
      />,
    );

    const textArea = screen.getByLabelText("Insight");
    const submitButton = screen.getByRole("button", { name: "Add insight" });

    fireEvent.change(textArea, { target: { value: "Test insight" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeTruthy();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnInsightAdded).not.toHaveBeenCalled();
  });

  it("changes brand selection", () => {
    const { getByLabelText } = render(
      <AddInsight
        open
        onClose={mockOnClose}
        onInsightAdded={mockOnInsightAdded}
      />,
    );

    const brandSelect = getByLabelText("Brand");
    fireEvent.change(brandSelect, { target: { value: "2" } });

    expect((brandSelect as HTMLSelectElement).value).toBe("2");
  });

  it("shows loading state during submission", () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() =>
      new Promise((resolve) =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => ({ success: true }),
          }), 100)
      )
    );

    const { getByLabelText, getByRole } = render(
      <AddInsight
        open
        onClose={mockOnClose}
        onInsightAdded={mockOnInsightAdded}
      />,
    );

    const textArea = getByLabelText("Insight");
    const submitButton = getByRole("button", { name: "Add insight" });

    fireEvent.change(textArea, { target: { value: "Test insight" } });
    fireEvent.click(submitButton);

    // Check loading state
    expect(getByRole("button", { name: "Adding..." })).toBeTruthy();
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
  });
});
