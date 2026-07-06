import { ZodError } from "zod";

export interface ToolAnnotations {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}

export interface JsonObjectSchema {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonObjectSchema;
  outputSchema?: JsonObjectSchema;
  annotations: ToolAnnotations;
}

export interface ToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export type ToolHandler<TClient> = (
  name: string,
  args: unknown,
  client: TClient
) => Promise<ToolResult>;

export interface ToolModule<TClient> {
  tools: ToolDefinition[];
  handler: ToolHandler<TClient>;
}

function formatValidationError(toolName: string, error: ZodError): ToolResult {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join(".") || "(root)",
    message: issue.message
  }));

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            summary: `Invalid input for tool ${toolName}.`,
            data: { error: "VALIDATION_ERROR", issues },
            suggestions: [
              "Fix the listed fields and call the tool again with corrected arguments."
            ]
          },
          null,
          2
        )
      }
    ],
    isError: true
  };
}

export class ToolRegistry<TClient> {
  private readonly definitions = new Map<string, ToolDefinition>();
  private readonly handlers = new Map<string, ToolHandler<TClient>>();

  public register(module: ToolModule<TClient>): void {
    for (const tool of module.tools) {
      if (this.definitions.has(tool.name)) {
        throw new Error(`Duplicate tool name detected: ${tool.name}`);
      }

      this.definitions.set(tool.name, tool);
      this.handlers.set(tool.name, module.handler);
    }
  }

  public listDefinitions(): ToolDefinition[] {
    return Array.from(this.definitions.values());
  }

  public async call(name: string, args: unknown, client: TClient): Promise<ToolResult> {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      return await handler(name, args, client);
    } catch (error) {
      // Per MCP spec (SEP-1303): input validation failures are tool execution
      // errors (isError: true), not protocol errors, so the model can self-correct.
      if (error instanceof ZodError) {
        return formatValidationError(name, error);
      }

      throw error;
    }
  }
}
