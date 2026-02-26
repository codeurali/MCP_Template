import { describe, expect, it } from "@jest/globals";
import { ToolRegistry } from "../../src/tools/tool-registry.js";
import { formatData } from "../../src/tools/output.utils.js";

describe("tool pipeline integration", () => {
  it("dispatches tool call through registry and returns formatted payload", async () => {
    const registry = new ToolRegistry<{ ping: () => string }>();

    registry.register({
      tools: [
        {
          name: "health_ping",
          description: "Ping endpoint. WHEN TO USE: quick health check. BEST PRACTICES: none. AVOID: none.",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false
          }
        }
      ],
      handler: async (name, _args, client) => {
        if (name !== "health_ping") {
          throw new Error("Unexpected tool");
        }

        return formatData("Ping complete.", { pong: client.ping() });
      }
    });

    const result = await registry.call("health_ping", {}, { ping: () => "ok" });
    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.summary).toBe("Ping complete.");
    expect(parsed.data).toEqual({ pong: "ok" });
  });
});
