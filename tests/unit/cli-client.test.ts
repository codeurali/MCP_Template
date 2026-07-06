import { describe, expect, it, beforeEach } from "@jest/globals";
import { CliClient, CliExitError, CliJsonParseError } from "../../src/cli-client/cli-client.js";
import type { CliConfig } from "../../src/config/config.schema.js";

const baseConfig: CliConfig = {
  cliPath: "echo",
  cwd: process.cwd(),
  timeoutMs: 5000
};

function makeClient(overrides?: Partial<CliConfig>): CliClient {
  return new CliClient({ ...baseConfig, ...overrides });
}

describe("CliClient.run", () => {
  it("returns stdout, stderr, and exitCode for a successful command", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });
    const result = await client.run(["-e", "process.stdout.write('hello')"]);

    expect(result.stdout).toBe("hello");
    expect(result.exitCode).toBe(0);
  });

  it("returns non-zero exitCode without throwing", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });
    const result = await client.run(["-e", "process.exit(42)"]);

    expect(result.exitCode).toBe(42);
  });
});

describe("CliClient.runOrThrow", () => {
  it("resolves on zero exit code", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });
    const result = await client.runOrThrow(["-e", "process.stdout.write('ok')"]);

    expect(result.stdout).toBe("ok");
  });

  it("throws CliExitError on non-zero exit", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });

    await expect(client.runOrThrow(["-e", "process.exit(1)"])).rejects.toBeInstanceOf(CliExitError);
  });

  it("CliExitError carries exitCode and command info", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });

    try {
      await client.runOrThrow(["-e", "process.exit(7)"]);
    } catch (err) {
      expect(err).toBeInstanceOf(CliExitError);
      expect((err as CliExitError).exitCode).toBe(7);
    }
  });
});

describe("CliClient.runJson", () => {
  it("parses valid JSON stdout", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });
    const result = await client.runJson<{ ok: boolean }>(["-e", 'process.stdout.write(JSON.stringify({ok:true}))']);

    expect(result.ok).toBe(true);
  });

  it("throws CliJsonParseError when stdout is not valid JSON", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });

    await expect(
      client.runJson(["-e", "process.stdout.write('not-json')"])
    ).rejects.toBeInstanceOf(CliJsonParseError);
  });

  it("throws CliExitError before attempting JSON parse on failure", async () => {
    const client = makeClient({ cliPath: "node", cwd: process.cwd() });

    await expect(
      client.runJson(["-e", "process.exit(1)"])
    ).rejects.toBeInstanceOf(CliExitError);
  });
});
