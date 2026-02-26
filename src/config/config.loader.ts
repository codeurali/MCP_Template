import type { Config } from "./config.schema.js";
import { ConfigSchema } from "./config.schema.js";

function parseOptionalNumber(value: string | undefined, name: string): number | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a valid number`);
  }

  return parsed;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return ConfigSchema.parse({
    apiBaseUrl: env.API_BASE_URL,
    apiToken: env.API_TOKEN,
    timeoutMs: parseOptionalNumber(env.TIMEOUT_MS, "TIMEOUT_MS"),
    maxRetries: parseOptionalNumber(env.MAX_RETRIES, "MAX_RETRIES")
  });
}