import { z } from "zod";

export const ConfigSchema = z.object({
  apiBaseUrl: z
    .string()
    .url("API_BASE_URL must be a valid URL")
    .startsWith("https://", { message: "API_BASE_URL must start with https://" }),
  apiToken: z.string().min(1, "API_TOKEN is required"),
  timeoutMs: z.number().int().positive().default(30_000),
  maxRetries: z.number().int().min(0).max(10).default(3)
});

export type Config = z.infer<typeof ConfigSchema>;