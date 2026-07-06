import { z } from "zod";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { formatData } from "./output.utils.js";
import type { ToolDefinition, ToolResult } from "./tool-registry.js";
import type { CliClient } from "../cli-client/cli-client.js";

const ExplorerOpenSchema = z.object({
  path: z
    .string()
    .min(1, "path must not be empty")
    .max(260, "path exceeds maximum Windows path length")
});

export const explorerTools: ToolDefinition[] = [
  {
    name: "explorer_open",
    description: [
      "Open a directory or file in Windows File Explorer.",
      "WHEN TO USE: Use when the user wants to browse or reveal a path on the Windows desktop.",
      "BEST PRACTICES: Provide an absolute path (e.g. D:/ or C:/Users). Explorer opens asynchronously — no stdout is returned.",
      "AVOID: Do not use to list directory contents; do not use on non-Windows systems."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute path to open (e.g. D:/ or C:/Users/me/Documents)"
        }
      },
      required: ["path"],
      additionalProperties: false
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  }
];

export interface ExplorerDeps {
  exists?: (p: string) => boolean;
  openPath?: (p: string) => void;
}

/**
 * Factory that creates the explorer tool handler with injectable deps.
 * Production code uses the defaults (real fs + real explorer.exe).
 * Tests pass mocks via the deps argument.
 */
export function createExplorerHandler(deps: ExplorerDeps = {}) {
  const exists = deps.exists ?? existsSync;
  const openPath = deps.openPath ?? ((p: string) => {
    // Fire-and-forget: explorer.exe is a GUI process that detaches immediately.
    const proc = spawn("explorer", [p], { detached: true, stdio: "ignore", shell: false });
    proc.unref();
  });

  return async function handleExplorerTool(
    name: string,
    args: unknown,
    _client: CliClient
  ): Promise<ToolResult> {
    if (name !== "explorer_open") {
      throw new Error(`Unknown tool: ${name}`);
    }

    const { path } = ExplorerOpenSchema.parse(args);

    if (!exists(path)) {
      return formatData(
        `Path not found: "${path}"`,
        { opened: false, error: "PATH_NOT_FOUND", path },
        undefined,
        [`"${path}" does not exist — verify the path and try again.`]
      );
    }

    openPath(path);

    return formatData(
      `Opened "${path}" in Windows File Explorer.`,
      { opened: true, path }
    );
  };
}

export const handleExplorerTool = createExplorerHandler();
