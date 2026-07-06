import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolResult
} from "@modelcontextprotocol/sdk/types.js";
import type { ResourceProvider } from "./resources/resource-provider.js";
import type { ToolRegistry } from "./tools/tool-registry.js";

export interface McpServerOptions<TClient> {
  name: string;
  version: string;
  description?: string;
  registry: ToolRegistry<TClient>;
  client: TClient;
  resources?: ResourceProvider;
}

/**
 * Build a fully wired MCP `Server` from a tool registry and an optional
 * resource provider. Transport selection stays in the entry points
 * (`server.ts`, `cli-server.ts`, `http-server.ts`); everything else is shared.
 */
export function createMcpServer<TClient>(options: McpServerOptions<TClient>): Server {
  const { name, version, description, registry, client, resources } = options;

  const server = new Server(
    { name, version, description },
    {
      capabilities: {
        tools: {},
        ...(resources ? { resources: {} } : {})
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.listDefinitions() as never[]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await registry.call(
      request.params.name,
      request.params.arguments ?? {},
      client
    );
    return result as CallToolResult;
  });

  if (resources) {
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: resources.list()
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => ({
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/markdown",
          text: resources.read(request.params.uri)
        }
      ]
    }));
  }

  return server;
}
