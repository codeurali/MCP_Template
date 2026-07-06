/**
 * cli-server.ts — POC entry-point for a CLI-backed MCP server.
 *
 * Replace `echo` (CLI_PATH=echo) with your own binary and extend
 * `echoTools` / `handleEchoTool` with domain-specific tools.
 *
 * Required env vars:
 *   CLI_PATH       Absolute or PATH-resolvable path to the CLI binary.
 *
 * Optional env vars:
 *   CLI_CWD        Working directory for spawned processes (default: process.cwd()).
 *   CLI_TIMEOUT_MS Per-invocation timeout in ms (default: 30000).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { CliClient } from "./cli-client/cli-client.js";
import { loadCliConfig } from "./config/config.loader.js";
import { echoTools, handleEchoTool } from "./tools/echo.tools.js";
import { explorerTools, handleExplorerTool } from "./tools/explorer.tools.js";
import { ToolRegistry } from "./tools/tool-registry.js";

export async function startCliServer(): Promise<void> {
  const config = loadCliConfig();
  const client = new CliClient(config);

  const registry = new ToolRegistry<CliClient>();
  registry.register({
    tools: echoTools,
    handler: handleEchoTool
  });
  registry.register({
    tools: explorerTools,
    handler: handleExplorerTool
  });

  const server = new Server(
    {
      name: "mcp-cli-poc-server",
      version: "0.1.0"
    },
    {
      capabilities: { tools: {} }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.listDefinitions() as any
  }));

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

startCliServer().catch((error) => {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Failed to start CLI MCP server: ${details}`);
  process.exit(1);
});
