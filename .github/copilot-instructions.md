# GitHub Copilot Instructions - MCP Builder

Use `agents/shared/mcp-builder-core.md` as the canonical rule set.

This repository is a template for generating Model Context Protocol (MCP) servers.
Agentic workflow assets live under `.github/`:

- Custom agent: `.github/agents/mcp-builder.agent.md`
- Prompt files: `.github/prompts/*.prompt.md` (`/new-mcp-server`, `/add-mcp-tool`, `/mcp-quality-gate`)
- Scoped instructions: `.github/instructions/*.instructions.md`
- Agent skill: `.github/skills/mcp-builder/SKILL.md`

## Coding Priorities

- Build deterministic MCP servers.
- Keep one action per tool.
- Validate all input using Zod at handler boundaries.
- Return structured tool outputs (`summary`, `data`, optional `suggestions`, `warnings`) via the helpers in `src/tools/output.utils.ts` — never hand-rolled JSON.
- Declare an `outputSchema` on every tool using `buildOutputSchema` and return matching `structuredContent` (MCP spec 2025-06-18+).
- Keep entry points (`src/server.ts`, `src/cli-server.ts`, `src/http-server.ts`) as transport wiring only; shared server assembly lives in `src/server-factory.ts` (`createMcpServer`).
- Let the `ToolRegistry` convert Zod failures into tool execution errors (`isError: true`); do not catch validation errors inside handlers.

## Tool Definition Standard

Each tool must include:

- Description with WHAT / WHEN TO USE / BEST PRACTICES / AVOID.
- `inputSchema` (JSON Schema mirroring the Zod schema).
- `outputSchema` built with `buildOutputSchema`.
- `annotations.readOnlyHint`
- `annotations.destructiveHint`
- `annotations.idempotentHint`
- `annotations.openWorldHint`

## Architecture Map

- `src/tools/[domain].tools.ts` — tool definitions + handler per domain.
- `src/tools/tool-registry.ts` — dispatch, duplicate detection, validation errors.
- `src/example-client/` / `src/cli-client/` — upstream API / CLI adapters (auth, retry, timeouts).
- `src/config/` — Zod-validated env config (fail fast at startup).
- `src/resources/` — MCP resources (`docs://capabilities`).
- `tests/unit/`, `tests/integration/` — contract and dispatch tests.

## Quality Gate Before Completion

Run and pass:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run check:file-size`

(or `npm run verify` for all four).
