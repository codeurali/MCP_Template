/**
 * server.ts — stdio entry point for the API-backed template server.
 *
 * Transport selection lives here; everything else (capabilities, request
 * handlers, resources) is wired by `createMcpServer` in server-factory.ts.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { EnvTokenAuthProvider } from "./auth/env-token-auth-provider.js";
import { ExampleApiClient } from "./example-client/client.js";
import { loadConfig } from "./config/config.loader.js";
import { ResourceProvider } from "./resources/resource-provider.js";
import { createMcpServer } from "./server-factory.js";
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

  const server = createMcpServer({
    name: "mcp-template-server",
    version: "0.1.0",
    description:
      "Manifesto-driven MCP template with atomic tools and structured outputs.",
    registry,
    client,
    resources: new ResourceProvider()
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch((error) => {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Failed to start MCP server: ${details}`);
  process.exit(1);
});
