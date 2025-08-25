import type { z } from "zod";
import { Insight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";

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

  const [{ id }] = input.db.sql<{ id: number }>`
    INSERT INTO insights (brand, createdAt, text)
    VALUES (${validatedInput.brand}, ${createdAt}, ${validatedInput.text})
    RETURNING id
  `;

  const result: Insight = {
    id,
    brand: validatedInput.brand,
    createdAt: new Date(createdAt),
    text: validatedInput.text,
  };

  console.log("Insight created:", result);
  return result;
};
