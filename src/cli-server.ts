/**
 * cli-server.ts — stdio entry point for a CLI-backed MCP server.
 *
 * Use this variant when your MCP server wraps a local CLI binary (git,
 * kubectl, terraform, your own tool) instead of a remote HTTP API. Replace
 * the bundled `cli_echo` smoke-test tool with your own domain tools.
 *
 * Required env vars:
 *   CLI_PATH       Absolute or PATH-resolvable path to the CLI binary.
 *
 * Optional env vars:
 *   CLI_BASE_ARGS  Fixed arguments prepended to every invocation.
 *   CLI_CWD        Working directory for spawned processes (default: process.cwd()).
 *   CLI_TIMEOUT_MS Per-invocation timeout in ms (default: 30000).
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CliClient } from "./cli-client/cli-client.js";
import { loadCliConfig } from "./config/config.loader.js";
import { createMcpServer } from "./server-factory.js";
import { echoTools, handleEchoTool } from "./tools/echo.tools.js";
import { ToolRegistry } from "./tools/tool-registry.js";

export async function startCliServer(): Promise<void> {
  const config = loadCliConfig();
  const client = new CliClient(config);

  const registry = new ToolRegistry<CliClient>();
  registry.register({
    tools: echoTools,
    handler: handleEchoTool
  });

  const server = createMcpServer({
    name: "mcp-template-cli-server",
    version: "0.1.0",
    description: "CLI-backed MCP template server with atomic tools and structured outputs.",
    registry,
    client
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startCliServer().catch((error) => {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Failed to start CLI MCP server: ${details}`);
  process.exit(1);
});
