import { z } from "zod";

// ── HTTP / REST API config ──────────────────────────────────────────────────
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

// ── CLI config ───────────────────────────────────────────────────────────────
// Use this when the MCP server wraps a local CLI binary (e.g. git, kubectl,
// terraform, your own tool) instead of calling a remote HTTP API.
export const CliConfigSchema = z.object({
  // Absolute or PATH-resolvable path to the CLI binary.
  cliPath: z.string().min(1, "CLI_PATH is required"),
  // Fixed arguments prepended before every tool-supplied argument.
  // Useful for subcommands or flags (e.g. ["-C", "/repo"] for git,
  // or ["/c", "echo"] when CLI_PATH=cmd on Windows).
  // Set via the CLI_BASE_ARGS env var as a space-separated string.
  cliBaseArgs: z.array(z.string()).default([]),
  // Working directory for every spawned process. Defaults to process.cwd().
  cwd: z.string().optional(),
  // Per-invocation timeout in milliseconds.
  timeoutMs: z.number().int().positive().default(30_000)
});

export type CliConfig = z.infer<typeof CliConfigSchema>;

// ── Streamable HTTP transport config ─────────────────────────────────────────
// Used by http-server.ts to expose the same tools over the MCP Streamable
// HTTP transport (spec revision 2025-03-26+) instead of stdio.
export const HttpConfigSchema = z.object({
  // TCP port to listen on.
  port: z.number().int().min(1).max(65_535).default(3000),
  // Bind address. Keep 127.0.0.1 unless deploying behind a reverse proxy.
  host: z.string().min(1).default("127.0.0.1"),
  // Host headers accepted by DNS-rebinding protection (spec requires
  // rejecting invalid Origin/Host). Extend via HTTP_ALLOWED_HOSTS when
  // serving on a public hostname.
  allowedHosts: z.array(z.string().min(1)).default([]),
  // Origin headers accepted for browser-based clients (HTTP_ALLOWED_ORIGINS).
  allowedOrigins: z.array(z.string().min(1)).default([])
});

export type HttpConfig = z.infer<typeof HttpConfigSchema>;