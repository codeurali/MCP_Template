import { spawn } from "node:child_process";
import type { CliConfig } from "../config/config.schema.js";

export class CliExitError extends Error {
  public readonly exitCode: number;
  public readonly stderr: string;

  public constructor(exitCode: number, stderr: string, command: string) {
    super(`CLI command failed with exit code ${exitCode}: ${command}`);
    this.name = "CliExitError";
    this.exitCode = exitCode;
    this.stderr = stderr;
  }
}

export class CliJsonParseError extends Error {
  public constructor(raw: string) {
    super(`Failed to parse CLI output as JSON. Raw output: ${raw.slice(0, 200)}`);
    this.name = "CliJsonParseError";
  }
}

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class CliClient {
  private readonly config: CliConfig;

  public constructor(config: CliConfig) {
    this.config = config;
  }

  /**
   * Run the CLI with the given args. Never throws — always returns the result including
   * non-zero exit codes. Use `runOrThrow` when a failure should surface as an error.
   */
  public async run(args: string[]): Promise<CliResult> {
    const fullArgs = [...(this.config.cliBaseArgs ?? []), ...args];
    return new Promise((resolve, reject) => {
      const proc = spawn(this.config.cliPath, fullArgs, {
        cwd: this.config.cwd,
        timeout: this.config.timeoutMs,
        env: process.env
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on("close", (code) => {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code ?? 1 });
      });

      proc.on("error", reject);
    });
  }

  /**
   * Run the CLI and throw `CliExitError` if the exit code is non-zero.
   */
  public async runOrThrow(args: string[]): Promise<CliResult> {
    const result = await this.run(args);

    if (result.exitCode !== 0) {
      const fullCmd = [this.config.cliPath, ...(this.config.cliBaseArgs ?? []), ...args].join(" ");
      throw new CliExitError(result.exitCode, result.stderr, fullCmd);
    }

    return result;
  }

  /**
   * Run the CLI expecting JSON on stdout. Throws `CliExitError` on non-zero exit, or
   * `CliJsonParseError` if the output cannot be parsed as JSON.
   */
  public async runJson<T>(args: string[]): Promise<T> {
    const result = await this.runOrThrow(args);

    try {
      return JSON.parse(result.stdout) as T;
    } catch {
      throw new CliJsonParseError(result.stdout);
    }
  }
}
