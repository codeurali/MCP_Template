---
mode: agent
description: Generate a new MCP server from this template for a described domain or API.
---

# Generate a New MCP Server

Build a complete MCP server from this template for the domain described below.
Follow `agents/shared/mcp-builder-core.md` as a strict policy and work through
the phases defined in `.github/agents/mcp-builder.agent.md` (Discover →
Implement → Test → Verify).

## Input

Domain / upstream description: ${input:domain:Describe the API or CLI to wrap, the entities, and the actions needed}

## Requirements

1. **Discover first.** Before editing any file, present the proposed tool map as a table (tool name, action, annotations, destructive? confirmation token?) and the chosen entry point(s) — stdio API (`server.ts`), CLI-backed (`cli-server.ts`), Streamable HTTP (`http-server.ts`). Wait for confirmation if anything is ambiguous.
2. **Replace the example domain.** Swap `src/tools/example.tools.ts` and `src/example-client/client.ts` for the real domain modules; keep the file layout, registry wiring, and `createMcpServer` factory unchanged.
3. **Config.** Extend `src/config/config.schema.ts` + `config.loader.ts` and `.env.example` for any new env vars. Fail fast on invalid config.
4. **Every tool** carries: WHAT / WHEN TO USE / BEST PRACTICES / AVOID description, minimal Zod schema, matching JSON `inputSchema`, `outputSchema` via `buildOutputSchema`, and all four annotations.
5. **Structured output only** through `formatData` / `formatList`; expected errors (e.g. NOT_FOUND) return recoverable structured responses, unexpected errors throw.
6. **Tests.** Unit tests per domain module plus an in-memory integration test cloned from `tests/integration/server-factory.integration.test.ts`.
7. **Docs.** Update `CAPABILITIES.md` and the README tool list.
8. **Finish with `npm run verify`** and fix all failures before reporting done.
