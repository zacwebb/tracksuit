import { z } from "zod";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";

const DeleteInsightInput = z.object({
  id: z.number().int().min(1),
});

type Input = HasDBClient & z.infer<typeof DeleteInsightInput>;

export default (input: Input): boolean => {
  console.log(`Deleting insight for id=${input.id}`);

  const validatedInput = DeleteInsightInput.parse({
    id: input.id,
  });

  // Check if the insight exists before attempting to delete
  const [existingInsight] = input.db.sql<
    insightsTable.Row
  >`SELECT id FROM insights WHERE id = ${validatedInput.id} LIMIT 1`;

  if (!existingInsight) {
    console.log(`Insight with id=${validatedInput.id} not found`);
    return false;
  }

  input.db.exec(
    insightsTable.deleteStatement(validatedInput.id),
  );

  console.log(`Insight with id=${validatedInput.id} deleted successfully`);
  return true;
};
