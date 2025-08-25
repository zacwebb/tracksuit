import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { assertThrows } from "jsr:@std/assert";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting insights from the database", () => {
  describe("valid deletion - insight exists", () => {
    withDB((fixture) => {
      let result: boolean;
      let insightId: number;

      beforeAll(() => {
        // Insert a test insight first
        fixture.insights.insert([{
          brand: 1,
          text: "Test insight to delete",
          createdAt: new Date().toISOString(),
        }]);

        // Get the inserted insight ID
        const allInsights = fixture.insights.selectAll();
        insightId = allInsights[0].id;

        // Delete the insight
        result = deleteInsight({
          ...fixture,
          id: insightId,
        });
      });

      it("returns true indicating successful deletion", () => {
        expect(result).toBe(true);
      });

      it("removes the insight from the database", () => {
        const allInsights = fixture.insights.selectAll();
        expect(allInsights).toHaveLength(0);
      });
    });
  });

  describe("invalid deletion - insight does not exist", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        // Try to delete a non-existent insight
        result = deleteInsight({
          ...fixture,
          id: 999,
        });
      });

      it("returns false indicating failed deletion", () => {
        expect(result).toBe(false);
      });

      it("does not affect other insights in the database", () => {
        // Insert some insights after the failed delete attempt
        fixture.insights.insert([
          {
            brand: 1,
            text: "First insight",
            createdAt: new Date().toISOString(),
          },
          {
            brand: 2,
            text: "Second insight",
            createdAt: new Date().toISOString(),
          },
        ]);

        const allInsights = fixture.insights.selectAll();
        expect(allInsights).toHaveLength(2);
      });
    });
  });

  describe("invalid input - missing id", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            deleteInsight({
              ...fixture,
              // 'as any' and disabled lint to enable failing the validator
              // deno-lint-ignore no-explicit-any
              id: undefined as any,
            }),
          Error,
          "Required",
        );
      });
    });
  });

  describe("invalid input - invalid id type", () => {
    withDB((fixture) => {
      it("throws validation error for string id", () => {
        assertThrows(
          () =>
            deleteInsight({
              ...fixture,
              // 'as any' and disabled lint to enable failing the validator
              // deno-lint-ignore no-explicit-any
              id: "invalid" as any,
            }),
          Error,
          "Expected number, received string",
        );
      });
    });
  });

  describe("invalid input - negative id", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            deleteInsight({
              ...fixture,
              id: -1,
            }),
          Error,
          "Number must be greater than or equal to 1",
        );
      });
    });
  });

  describe("invalid input - zero id", () => {
    withDB((fixture) => {
      it("throws validation error", () => {
        assertThrows(
          () =>
            deleteInsight({
              ...fixture,
              id: 0,
            }),
          Error,
          "Number must be greater than or equal to 1",
        );
      });
    });
  });

  describe("deletion with multiple insights", () => {
    withDB((fixture) => {
      let result: boolean;
      let targetId: number;

      beforeAll(() => {
        // Insert multiple test insights
        fixture.insights.insert([
          {
            brand: 1,
            text: "First insight",
            createdAt: new Date().toISOString(),
          },
          {
            brand: 2,
            text: "Second insight to delete",
            createdAt: new Date().toISOString(),
          },
          {
            brand: 3,
            text: "Third insight",
            createdAt: new Date().toISOString(),
          },
        ]);

        // Get the second insight ID (the one we want to delete)
        const allInsights = fixture.insights.selectAll();
        targetId = allInsights[1].id;

        // Delete the second insight
        result = deleteInsight({
          ...fixture,
          id: targetId,
        });
      });

      it("returns true indicating successful deletion", () => {
        expect(result).toBe(true);
      });

      it("removes only the targeted insight", () => {
        const remainingInsights = fixture.insights.selectAll();
        expect(remainingInsights).toHaveLength(2);
        expect(remainingInsights.find((insight) => insight.id === targetId))
          .toBeUndefined();
        expect(remainingInsights[0].text).toBe("First insight");
        expect(remainingInsights[1].text).toBe("Third insight");
      });
    });
  });
});
