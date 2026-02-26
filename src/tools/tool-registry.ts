export interface ToolAnnotations {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  annotations: ToolAnnotations;
}

export interface ToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
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

    return handler(name, args, client);
  }
}