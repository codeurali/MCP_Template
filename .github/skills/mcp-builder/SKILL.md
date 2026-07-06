---
name: mcp-builder
description: Build and maintain Model Context Protocol servers from this template using deterministic architecture, atomic tools, strict Zod validation, structured outputs with outputSchema/structuredContent, and observable execution. Use when creating a new MCP server, adding or refactoring tools, designing tool schemas, adding MCP tests, or preparing an MCP package for publication.
---

# MCP Builder Skill

Read `agents/shared/mcp-builder-core.md` first and apply all constraints.

## Template Map

- Entry points (transport wiring only): `src/server.ts` (stdio + HTTP API upstream), `src/cli-server.ts` (stdio + local CLI upstream), `src/http-server.ts` (Streamable HTTP transport).
- Shared assembly: `src/server-factory.ts` (`createMcpServer`) — tools, resources, request handlers.
- Tool modules: `src/tools/[domain].tools.ts`; dispatch via `src/tools/tool-registry.ts`.
- Output helpers: `src/tools/output.utils.ts` (`formatData`, `formatList`, `buildOutputSchema`).
- Upstream adapters: `src/example-client/` (HTTP), `src/cli-client/` (spawned CLI).
- Config: `src/config/` — Zod-validated env config, fail fast at startup.

## Execute This Workflow

1. Model domains and atomic tool boundaries before writing code; confirm the tool map.
2. Create one `[domain].tools.ts` module per domain.
3. Validate inputs with Zod at handler entry; let the registry turn Zod failures into `isError` tool results.
4. Keep API/auth/retry logic in the client adapter.
5. Return structured output using the shared output helpers, and declare `outputSchema` with `buildOutputSchema` on every tool.
6. Add unit tests for definitions, annotations, and error paths, plus an in-memory integration test through `createMcpServer`.
7. Keep files under 400 lines.
8. Run `npm run verify` before finishing.

## Tool Authoring Rules

- Include the four required annotations on every tool.
- Follow description format: WHAT, WHEN TO USE, BEST PRACTICES, AVOID.
- Keep schemas minimal and focused; JSON `inputSchema` mirrors the Zod schema.
- Destructive tools require a literal confirmation token.
- Reject hidden routing, hidden orchestration, and implicit fallback behaviour.

## Error Handling Rules

- Let Zod errors surface for invalid arguments (registry formats them).
- Return structured recoverable responses for expected errors.
- Throw unexpected failures to preserve observability.

## Publication Gate

Do not publish until all are true:

- Build, lint, typecheck, and tests pass (`npm run verify`).
- `CAPABILITIES.md` matches the registered tools.
- Config schema and `.env.example` are consistent.
- No secrets are committed.
