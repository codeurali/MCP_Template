import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createExplorerHandler, explorerTools } from "../../src/tools/explorer.tools.js";
import { ToolRegistry } from "../../src/tools/tool-registry.js";

describe("explorerTools definitions", () => {
  it("registers without duplicates", () => {
    const registry = new ToolRegistry<unknown>();
    expect(() =>
      registry.register({ tools: explorerTools, handler: async () => ({ content: [] }) })
    ).not.toThrow();
  });

  it("has all required annotations", () => {
    for (const tool of explorerTools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: expect.any(Boolean),
        destructiveHint: expect.any(Boolean),
        idempotentHint: expect.any(Boolean),
        openWorldHint: expect.any(Boolean)
      });
    }
  });
});

describe("handleExplorerTool (via createExplorerHandler)", () => {
  const mockExists = jest.fn<(p: string) => boolean>();
  const mockOpenPath = jest.fn<(p: string) => void>();
  const handler = createExplorerHandler({ exists: mockExists, openPath: mockOpenPath });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens the path and returns success when path exists", async () => {
    mockExists.mockReturnValue(true);

    const result = await handler("explorer_open", { path: "D:/" }, null as any);
    const parsed = JSON.parse(result.content[0]!.text);

    expect(mockExists).toHaveBeenCalledWith("D:/");
    expect(mockOpenPath).toHaveBeenCalledWith("D:/");
    expect(parsed.data.opened).toBe(true);
    expect(parsed.data.path).toBe("D:/");
    expect(parsed.summary).toMatch(/Opened/i);
  });

  it("returns PATH_NOT_FOUND when path does not exist", async () => {
    mockExists.mockReturnValue(false);

    const result = await handler("explorer_open", { path: "Z:/nonexistent" }, null as any);
    const parsed = JSON.parse(result.content[0]!.text);

    expect(mockOpenPath).not.toHaveBeenCalled();
    expect(parsed.data.opened).toBe(false);
    expect(parsed.data.error).toBe("PATH_NOT_FOUND");
    expect(parsed.warnings).toHaveLength(1);
  });

  it("throws on unknown tool name", async () => {
    await expect(
      handler("other_tool", { path: "D:/" }, null as any)
    ).rejects.toThrow(/Unknown tool/);
  });

  it("throws on empty path (Zod validation)", async () => {
    await expect(
      handler("explorer_open", { path: "" }, null as any)
    ).rejects.toThrow();
  });

  it("throws on missing path (Zod validation)", async () => {
    await expect(
      handler("explorer_open", {}, null as any)
    ).rejects.toThrow();
  });

  it("throws on path exceeding 260 chars (Zod validation)", async () => {
    await expect(
      handler("explorer_open", { path: "D:/" + "a".repeat(260) }, null as any)
    ).rejects.toThrow();
  });
});
