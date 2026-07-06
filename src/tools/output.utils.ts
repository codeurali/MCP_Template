import type { JsonObjectSchema, ToolResult } from "./tool-registry.js";

export interface ToolOutput {
  summary: string;
  data: unknown;
  suggestions?: string[];
  warnings?: string[];
}

/**
 * Standard result envelope. Returns both `structuredContent` (typed, for
 * clients that consume it) and an equivalent `text` block (backward
 * compatibility, as recommended by the MCP spec).
 */
export function formatToolOutput(payload: ToolOutput): ToolResult {
  const structured: Record<string, unknown> = {
    summary: payload.summary,
    data: payload.data
  };

  if (payload.suggestions !== undefined) {
    structured.suggestions = payload.suggestions;
  }
  if (payload.warnings !== undefined) {
    structured.warnings = payload.warnings;
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structured, null, 2)
      }
    ],
    structuredContent: structured
  };
}

export function formatData(
  summary: string,
  data: unknown,
  suggestions?: string[],
  warnings?: string[]
): ToolResult {
  return formatToolOutput({
    summary,
    data,
    suggestions,
    warnings
  });
}

export function formatList(
  entity: string,
  items: unknown[],
  suggestions?: string[],
  warnings?: string[]
): ToolResult {
  return formatToolOutput({
    summary: `Retrieved ${items.length} ${entity}.`,
    data: {
      total: items.length,
      items
    },
    suggestions,
    warnings
  });
}

/**
 * Wrap a tool-specific `data` schema in the standard output envelope so every
 * tool advertises the same `summary`/`data`/`suggestions`/`warnings` contract.
 */
export function buildOutputSchema(dataSchema: Record<string, unknown>): JsonObjectSchema {
  return {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "One-line human-readable result"
      },
      data: dataSchema,
      suggestions: {
        type: "array",
        items: { type: "string" },
        description: "Optional follow-up actions for the agent"
      },
      warnings: {
        type: "array",
        items: { type: "string" },
        description: "Optional caveats about the result"
      }
    },
    required: ["summary", "data"],
    additionalProperties: false
  };
}
