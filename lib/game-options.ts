import { z } from "zod";

export const gameOptionsSchema = z.object({
  words: z.string().array().array(),
  names: z.string().array(),
  author: z.string(), // optional, but just empty if not used
  title: z.string(), // optional, but just empty if not used
});

export type GameOptions = z.infer<typeof gameOptionsSchema>;
