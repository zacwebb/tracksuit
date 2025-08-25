import type { z } from "zod";
import { Insight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import * as insightsTable from "$tables/insights.ts";

// Input schema for creating an insight (excludes id and createdAt)
const CreateInsightInput = Insight.omit({ id: true, createdAt: true });

type Input = HasDBClient & z.infer<typeof CreateInsightInput>;

export default (input: Input): Insight => {
  console.log(
    `Creating insight for brand=${input.brand}"`,
  );

  const validatedInput = CreateInsightInput.parse({
    brand: input.brand,
    text: input.text,
  });

  const createdAt = new Date().toISOString();

  const insertData: insightsTable.Insert = {
    brand: validatedInput.brand,
    createdAt,
    text: validatedInput.text,
  };

  // Insert the new insight
  input.db.exec(insightsTable.insertStatement(insertData));

  // Get the last inserted row ID
  const [{ "last_insert_rowid()": id }] = input.db.sql<
    { "last_insert_rowid()": number }
  >`SELECT last_insert_rowid()`;

  const result: Insight = {
    id,
    brand: validatedInput.brand,
    createdAt: new Date(createdAt),
    text: validatedInput.text,
  };

  console.log("Insight created:", result);
  return result;
};
