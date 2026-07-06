/**
 * End-to-end test over an in-memory transport: a real MCP Client talks to a
 * server built by createMcpServer. The SDK client validates structuredContent
 * against each tool's outputSchema, so this also asserts spec conformance.
 */
import { describe, expect, it } from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ResourceProvider } from "../../src/resources/resource-provider.js";
import { createMcpServer } from "../../src/server-factory.js";
import { exampleTools, handleExampleTool } from "../../src/tools/example.tools.js";
import { ToolRegistry } from "../../src/tools/tool-registry.js";
import type { ExampleApiClient } from "../../src/example-client/client.js";

const THING_ID = "00000000-0000-4000-8000-000000000001";

const stubApiClient = {
  getThing: async (id: string) => ({ id, name: "Alpha" }),
  listThings: async () => [{ id: THING_ID, name: "Alpha" }],
  deleteThing: async () => undefined
} as unknown as ExampleApiClient;

async function connectClient(): Promise<Client> {
  const registry = new ToolRegistry<ExampleApiClient>();
  registry.register({ tools: exampleTools, handler: handleExampleTool });

  const server = createMcpServer({
    name: "test-server",
    version: "0.0.1",
    registry,
    client: stubApiClient,
    resources: new ResourceProvider()
  });

  const client = new Client({ name: "test-client", version: "0.0.1" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe("createMcpServer over in-memory transport", () => {
  it("lists tools with input schema, output schema, and annotations", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name)).toEqual([
      "example_get_thing",
      "example_list_things",
      "example_delete_thing"
    ]);

    for (const tool of tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.outputSchema).toBeDefined();
      expect(tool.annotations).toBeDefined();
    }

    await client.close();
  });

  it("returns structuredContent that conforms to the declared outputSchema", async () => {
    const client = await connectClient();

    // The SDK client throws if structuredContent is missing or fails
    // outputSchema validation, so a successful call proves conformance.
    const result = await client.callTool({
      name: "example_get_thing",
      arguments: { id: THING_ID }
    });

    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as Record<string, unknown>;
    expect(structured.summary).toMatch(/retrieved successfully/i);
    expect(structured.data).toMatchObject({ id: THING_ID, name: "Alpha" });

    await client.close();
  });

  it("returns a tool execution error (not a protocol error) on invalid input", async () => {
    const client = await connectClient();

    const result = await client.callTool({
      name: "example_get_thing",
      arguments: { id: "not-a-uuid" }
    });

    expect(result.isError).toBe(true);
    const content = result.content as Array<{ type: string; text: string }>;
    const parsed = JSON.parse(content[0]!.text);
    expect(parsed.data.error).toBe("VALIDATION_ERROR");

    await client.close();
  });

  it("exposes and serves the capabilities resource", async () => {
    const client = await connectClient();

    const { resources } = await client.listResources();
    expect(resources).toHaveLength(1);
    expect(resources[0]!.uri).toBe("docs://capabilities");

    const { contents } = await client.readResource({ uri: "docs://capabilities" });
    expect(contents[0]!.mimeType).toBe("text/markdown");
    expect(contents[0]!.text).toMatch(/Atomic tools only/);

    await client.close();
  });
});
