import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CliExitError } from "../../src/cli-client/cli-client.js";
import { echoTools, handleEchoTool } from "../../src/tools/echo.tools.js";
import { ToolRegistry } from "../../src/tools/tool-registry.js";
import type { CliClient } from "../../src/cli-client/cli-client.js";

describe("echoTools definitions", () => {
  it("registers without duplicates", () => {
    const registry = new ToolRegistry<unknown>();
    expect(() =>
      registry.register({ tools: echoTools, handler: async () => ({ content: [] }) })
    ).not.toThrow();
  });

  it("has all required annotations", () => {
    for (const tool of echoTools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: expect.any(Boolean),
        destructiveHint: expect.any(Boolean),
        idempotentHint: expect.any(Boolean),
        openWorldHint: expect.any(Boolean)
      });
    }
  });
});

describe("handleEchoTool", () => {
  const mockClient = {
    run: jest.fn(),
    runOrThrow: jest.fn(),
    runJson: jest.fn()
  } as unknown as jest.Mocked<CliClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stdout in data.output on success", async () => {
    (mockClient.runOrThrow as jest.Mock).mockResolvedValue({ stdout: "hello world", stderr: "", exitCode: 0 });

    const result = await handleEchoTool("cli_echo", { message: "hello world" }, mockClient);
    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.summary).toMatch(/Echo completed/i);
    expect(parsed.data.output).toBe("hello world");
    expect(mockClient.runOrThrow).toHaveBeenCalledWith(["hello world"]);
  });

  it("returns CLI_ERROR payload on CliExitError", async () => {
    (mockClient.runOrThrow as jest.Mock).mockRejectedValue(
      new CliExitError(1, "bad command", "echo bad command")
    );

    const result = await handleEchoTool("cli_echo", { message: "bad" }, mockClient);
    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.data.error).toBe("CLI_ERROR");
    expect(parsed.data.exitCode).toBe(1);
  });

  it("throws on unknown tool name", async () => {
    await expect(
      handleEchoTool("unknown_tool", { message: "hi" }, mockClient)
    ).rejects.toThrow(/Unknown tool/);
  });

  it("throws on empty message (Zod validation)", async () => {
    await expect(
      handleEchoTool("cli_echo", { message: "" }, mockClient)
    ).rejects.toThrow();
  });

  it("throws on missing message (Zod validation)", async () => {
    await expect(
      handleEchoTool("cli_echo", {}, mockClient)
    ).rejects.toThrow();
  });

  it("throws on message exceeding 500 chars (Zod validation)", async () => {
    await expect(
      handleEchoTool("cli_echo", { message: "x".repeat(501) }, mockClient)
    ).rejects.toThrow();
  });

  it("re-throws non-CliExitError errors", async () => {
    (mockClient.runOrThrow as jest.Mock).mockRejectedValue(new Error("unexpected"));

    await expect(
      handleEchoTool("cli_echo", { message: "hi" }, mockClient)
    ).rejects.toThrow("unexpected");
  });
});
