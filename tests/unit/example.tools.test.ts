import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundError } from "../../src/example-client/client.js";
import { exampleTools, handleExampleTool } from "../../src/tools/example.tools.js";
import { ToolRegistry } from "../../src/tools/tool-registry.js";

describe("exampleTools definitions", () => {
  it("registers without duplicates", () => {
    const registry = new ToolRegistry<unknown>();
    expect(() => registry.register({ tools: exampleTools, handler: async () => ({ content: [] }) })).not.toThrow();
  });

  it("fails on duplicate registrations", () => {
    const registry = new ToolRegistry<unknown>();
    registry.register({ tools: exampleTools, handler: async () => ({ content: [] }) });

    expect(() => registry.register({ tools: exampleTools, handler: async () => ({ content: [] }) })).toThrow(
      /Duplicate tool/
    );
  });

  it("sets all required annotations", () => {
    for (const tool of exampleTools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: expect.any(Boolean),
        destructiveHint: expect.any(Boolean),
        idempotentHint: expect.any(Boolean),
        openWorldHint: expect.any(Boolean)
      });
    }
  });
});

describe("handleExampleTool", () => {
  const mockClient = {
    getThing: jest.fn(),
    listThings: jest.fn(),
    deleteThing: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns summary and data for example_get_thing", async () => {
    mockClient.getThing.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000001",
      name: "Alpha"
    });

    const result = await handleExampleTool(
      "example_get_thing",
      { id: "00000000-0000-4000-8000-000000000001" },
      mockClient as any
    );

    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed.summary).toMatch(/retrieved successfully/i);
    expect(parsed.data).toHaveProperty("id");
    expect(Array.isArray(parsed.suggestions)).toBe(true);
  });

  it("returns structured not found for expected not found error", async () => {
    mockClient.getThing.mockRejectedValue(new NotFoundError("Missing"));

    const result = await handleExampleTool(
      "example_get_thing",
      { id: "00000000-0000-4000-8000-000000000001" },
      mockClient as any
    );

    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed.data.error).toBe("NOT_FOUND");
    expect(parsed.summary).toMatch(/not found/i);
  });

  it("rejects invalid UUID", async () => {
    await expect(handleExampleTool("example_get_thing", { id: "not-a-uuid" }, mockClient as any)).rejects.toThrow();
  });

  it("uses default top for example_list_things", async () => {
    mockClient.listThings.mockResolvedValue([{ id: "a", name: "Thing A" }]);

    const result = await handleExampleTool("example_list_things", {}, mockClient as any);

    expect(mockClient.listThings).toHaveBeenCalledWith({ filter: undefined, top: 25 });
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed.data.total).toBe(1);
  });

  it("deletes one record for example_delete_thing", async () => {
    mockClient.deleteThing.mockResolvedValue(undefined);

    const result = await handleExampleTool(
      "example_delete_thing",
      {
        id: "00000000-0000-4000-8000-000000000001",
        confirmation: "DELETE"
      },
      mockClient as any
    );

    expect(mockClient.deleteThing).toHaveBeenCalledWith("00000000-0000-4000-8000-000000000001");
    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed.data.deleted).toBe(true);
  });

  it("rejects delete when confirmation token is missing", async () => {
    await expect(
      handleExampleTool(
        "example_delete_thing",
        { id: "00000000-0000-4000-8000-000000000001" },
        mockClient as any
      )
    ).rejects.toThrow();
  });

  it("returns structured not found for delete on missing record", async () => {
    mockClient.deleteThing.mockRejectedValue(new NotFoundError("Missing"));

    const result = await handleExampleTool(
      "example_delete_thing",
      {
        id: "00000000-0000-4000-8000-000000000001",
        confirmation: "DELETE"
      },
      mockClient as any
    );

    const parsed = JSON.parse(result.content[0]!.text);
    expect(parsed.data.deleted).toBe(false);
    expect(parsed.data.error).toBe("NOT_FOUND");
  });
});
