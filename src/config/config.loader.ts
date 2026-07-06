import type { CliConfig, Config, HttpConfig } from "./config.schema.js";
import { CliConfigSchema, ConfigSchema, HttpConfigSchema } from "./config.schema.js";

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

// ── HTTP / REST API loader ───────────────────────────────────────────────────
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return ConfigSchema.parse({
    apiBaseUrl: env.API_BASE_URL,
    apiToken: env.API_TOKEN,
    timeoutMs: parseOptionalNumber(env.TIMEOUT_MS, "TIMEOUT_MS"),
    maxRetries: parseOptionalNumber(env.MAX_RETRIES, "MAX_RETRIES")
  });
}

// ── CLI loader ───────────────────────────────────────────────────────────────
// Required env vars: CLI_PATH
// Optional env vars: CLI_BASE_ARGS (space-separated), CLI_CWD, CLI_TIMEOUT_MS
export function loadCliConfig(env: NodeJS.ProcessEnv = process.env): CliConfig {
  const rawBaseArgs = env.CLI_BASE_ARGS?.trim();
  const cliBaseArgs = rawBaseArgs ? rawBaseArgs.split(/\s+/) : [];

  return CliConfigSchema.parse({
    cliPath: env.CLI_PATH,
    cliBaseArgs,
    cwd: env.CLI_CWD,
    timeoutMs: parseOptionalNumber(env.CLI_TIMEOUT_MS, "CLI_TIMEOUT_MS")
  });
}

// ── Streamable HTTP transport loader ─────────────────────────────────────────
// Optional env vars: HTTP_PORT, HTTP_HOST, HTTP_ALLOWED_HOSTS,
// HTTP_ALLOWED_ORIGINS (comma-separated lists).
function parseList(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function loadHttpConfig(env: NodeJS.ProcessEnv = process.env): HttpConfig {
  return HttpConfigSchema.parse({
    port: parseOptionalNumber(env.HTTP_PORT, "HTTP_PORT"),
    host: env.HTTP_HOST?.trim() || undefined,
    allowedHosts: parseList(env.HTTP_ALLOWED_HOSTS),
    allowedOrigins: parseList(env.HTTP_ALLOWED_ORIGINS)
  });
}