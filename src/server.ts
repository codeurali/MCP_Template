import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { EnvTokenAuthProvider } from "./auth/env-token-auth-provider.js";
import { ExampleApiClient } from "./example-client/client.js";
import { loadConfig } from "./config/config.loader.js";
import { exampleTools, handleExampleTool } from "./tools/example.tools.js";
import { ToolRegistry } from "./tools/tool-registry.js";

export async function startServer(): Promise<void> {
  const config = loadConfig();
  const authProvider = new EnvTokenAuthProvider(config.apiToken);
  const client = new ExampleApiClient(config, authProvider);

  const registry = new ToolRegistry<ExampleApiClient>();
  registry.register({
    tools: exampleTools,
    handler: handleExampleTool
  });

  const server = new Server(
    {
      name: "mcp-template-server",
      version: "0.1.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: registry.listDefinitions() as any
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await registry.call(
      request.params.name,
      request.params.arguments ?? {},
      client
    );

    return result as any;
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch((error) => {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Failed to start MCP server: ${details}`);
  process.exit(1);
});