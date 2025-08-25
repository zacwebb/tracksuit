import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brand: 1,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    text: "Test insight",
  },
  {
    id: 2,
    brand: 2,
    createdAt: new Date("2024-02-20T14:45:00Z"),
    text: "Another test insight",
  },
];

describe("insights", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders insights with text content", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} />);
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
    expect(getByText(TEST_INSIGHTS[1].text)).toBeTruthy();
  });

  it("renders dates correctly", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} />);
    const expectedDate1 = TEST_INSIGHTS[0].createdAt.toLocaleDateString();
    const expectedDate2 = TEST_INSIGHTS[1].createdAt.toLocaleDateString();

    expect(getByText(expectedDate1)).toBeTruthy();
    expect(getByText(expectedDate2)).toBeTruthy();
  });

  it("displays 'We have no insight!' when no insights are provided", () => {
    const { getByText } = render(<Insights insights={[]} />);
    expect(getByText("We have no insight!")).toBeTruthy();
  });

  it("renders brand information", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} />);
    expect(getByText("Brand 1")).toBeTruthy();
    expect(getByText("Brand 2")).toBeTruthy();
  });
});
