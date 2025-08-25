import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertThrows } from "jsr:@std/assert";
import { withDB } from "../testing.ts";
import type { Insight } from "$models/insight.ts";
import createInsight from "./create-insight.ts";

describe("creating insights in the database", () => {
  describe("valid input", () => {
    withDB((fixture) => {
      let result: Insight;

      beforeAll(() => {
        result = createInsight({
          ...fixture,
          brand: 1,
          text: "This is a test insight",
        });
      });

      it("returns the created insight with generated id", () => {
        expect(result.id).toBeGreaterThan(0);
        expect(result.brand).toBe(1);
        expect(result.text).toBe("This is a test insight");
        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it("persists the insight in the database", () => {
        const allInsights = fixture.insights.selectAll();
        expect(allInsights).toHaveLength(1);
        expect(allInsights[0].id).toBe(result.id);
        expect(allInsights[0].brand).toBe(1);
        expect(allInsights[0].text).toBe("This is a test insight");
      });
    });
  });

  describe("invalid input - missing brand", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            createInsight({
              ...fixture,
              // 'as any' and disabled lint to enable failing the validator
              // deno-lint-ignore no-explicit-any
              brand: undefined as any,
              text: "This is a test insight",
            }),
          Error,
          "Required",
        );
      });
    });
  });

  describe("invalid input - missing text", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            createInsight({
              ...fixture,
              brand: 1,
              // 'as any' and disabled lint to enable failing the validator
              // deno-lint-ignore no-explicit-any
              text: undefined as any,
            }),
          Error,
          "Required",
        );
      });
    });
  });

  describe("invalid input - empty text", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            createInsight({
              ...fixture,
              brand: 1,
              text: "",
            }),
          Error,
          "String must contain at least 1 character(s)",
        );
      });
    });
  });

  describe("invalid input - negative brand", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            createInsight({
              ...fixture,
              brand: -1,
              text: "This is a test insight",
            }),
          Error,
          "Number must be greater than or equal to 0",
        );
      });
    });
  });
});
