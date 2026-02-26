import type { ToolResult } from "./tool-registry.js";

export interface ToolOutput {
  summary: string;
  data: unknown;
  suggestions?: string[];
  warnings?: string[];
}

export function formatToolOutput(payload: ToolOutput): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
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