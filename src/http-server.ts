/**
 * http-server.ts — entry-point exposing the example tools over the MCP
 * Streamable HTTP transport (spec revision 2025-03-26+) instead of stdio.
 *
 * Runs stateless: each request gets a fresh Server + transport pair, which
 * keeps the template horizontally scalable and free of session bookkeeping.
 *
 * Required env vars: API_BASE_URL, API_TOKEN (same as server.ts).
 * Optional env vars: HTTP_PORT (default 3000), HTTP_HOST (default 127.0.0.1),
 * HTTP_ALLOWED_HOSTS, HTTP_ALLOWED_ORIGINS (comma-separated).
 */
import { createServer as createNodeHttpServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { EnvTokenAuthProvider } from "./auth/env-token-auth-provider.js";
import { ExampleApiClient } from "./example-client/client.js";
import { loadConfig, loadHttpConfig } from "./config/config.loader.js";
import { ResourceProvider } from "./resources/resource-provider.js";
import { createMcpServer } from "./server-factory.js";
import { exampleTools, handleExampleTool } from "./tools/example.tools.js";
import { ToolRegistry } from "./tools/tool-registry.js";

const MCP_PATH = "/mcp";

export async function startHttpServer(): Promise<void> {
  const config = loadConfig();
  const httpConfig = loadHttpConfig();
  const authProvider = new EnvTokenAuthProvider(config.apiToken);
  const client = new ExampleApiClient(config, authProvider);

  // Per the MCP spec, servers must validate Origin/Host to prevent DNS
  // rebinding. Local hostnames are always allowed; extend the lists via env
  // vars when serving behind a public hostname.
  const localHosts = [
    "127.0.0.1",
    `127.0.0.1:${httpConfig.port}`,
    "localhost",
    `localhost:${httpConfig.port}`
  ];
  const allowedHosts = [...localHosts, ...httpConfig.allowedHosts];
  const allowedOrigins = [
    ...localHosts.map((host) => `http://${host}`),
    ...httpConfig.allowedOrigins
  ];

  const httpServer = createNodeHttpServer(async (req, res) => {
    const pathname = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
      .pathname;

    if (pathname !== MCP_PATH) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: `Not found. MCP endpoint is ${MCP_PATH}` }));
      return;
    }

    try {
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

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
        enableDnsRebindingProtection: true,
        allowedHosts,
        allowedOrigins
      });

      res.on("close", () => {
        void transport.close();
        void server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      console.error(`Failed to handle MCP request: ${details}`);
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(httpConfig.port, httpConfig.host, resolve);
  });

  // stdio is unused by this transport; stderr keeps logs out of client parsing.
  console.error(
    `MCP Streamable HTTP server listening on http://${httpConfig.host}:${httpConfig.port}${MCP_PATH}`
  );
}

startHttpServer().catch((error) => {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Failed to start MCP HTTP server: ${details}`);
  process.exit(1);
});
