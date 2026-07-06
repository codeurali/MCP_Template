import { z } from "zod";
import { CliExitError } from "../cli-client/cli-client.js";
import { buildOutputSchema, formatData } from "./output.utils.js";
import type { ToolDefinition, ToolResult } from "./tool-registry.js";
import type { CliClient } from "../cli-client/cli-client.js";

const EchoSchema = z.object({
  message: z.string().min(1, "message must be a non-empty string").max(500)
});

export const echoTools: ToolDefinition[] = [
  {
    name: "cli_echo",
    description: [
      "Echo a message back via the underlying CLI binary.",
      "WHEN TO USE: Use to verify the CLI transport is wired correctly (smoke test / POC).",
      "BEST PRACTICES: Pass a short message; the raw stdout is returned as-is.",
      "AVOID: Not intended for production workloads — replace with domain-specific tools."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The text to echo. Max 500 characters."
        }
      },
      required: ["message"],
      additionalProperties: false
    },
    outputSchema: buildOutputSchema({
      type: "object",
      properties: {
        output: { type: "string", description: "Raw stdout on success" },
        error: { type: "string", description: "Present only on failure, e.g. CLI_ERROR" },
        exitCode: { type: "number" },
        stderr: { type: "string" }
      }
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  }
];

export async function handleEchoTool(
  name: string,
  args: unknown,
  client: CliClient
): Promise<ToolResult> {
  if (name !== "cli_echo") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const { message } = EchoSchema.parse(args);

  try {
    const result = await client.runOrThrow([message]);
    return formatData("Echo completed.", { output: result.stdout }, ["Check stdout for the echoed message."]);
  } catch (err) {
    if (err instanceof CliExitError) {
      return formatData(
        "CLI exited with a non-zero code.",
        { error: "CLI_ERROR", exitCode: err.exitCode, stderr: err.stderr },
        undefined,
        [`Exit code ${err.exitCode} — verify CLI_PATH points to a valid binary.`]
      );
    }
    throw err;
  }
}
