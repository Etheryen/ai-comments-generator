import { z } from "zod";

export const newQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Query must not be empty")
    .max(300, "Query must be at most 300 characters long"),
});
