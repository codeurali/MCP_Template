---
mode: agent
description: Add one atomic tool to an existing MCP domain module in this server.
---

# Add an MCP Tool

Add a single atomic tool to this MCP server. Follow
`agents/shared/mcp-builder-core.md` as a strict policy.

## Input

Tool to add: ${input:tool:Describe the action, its inputs, and which domain it belongs to}

## Requirements

1. One tool = one action. If the request bundles several actions (e.g. "create or update"), split it and confirm the split before implementing.
2. Place the tool in the matching `src/tools/[domain].tools.ts`; create a new domain module (plus registry registration in the entry point) only if no domain fits. Keep the file under 400 lines — split before exceeding it.
3. Definition must include:
   - Description in WHAT / WHEN TO USE / BEST PRACTICES / AVOID order, with the alternative tool named in AVOID.
   - Minimal Zod schema parsed at handler entry; JSON `inputSchema` mirroring it exactly (`additionalProperties: false`).
   - `outputSchema` built with `buildOutputSchema` describing the `data` payload.
   - All four annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) set deliberately — justify each value in your summary.
4. If the tool is destructive: `destructiveHint: true` plus a required literal confirmation field (see `example_delete_thing`).
5. Handler branch returns only via `formatData` / `formatList`; expected upstream errors map to structured recoverable responses, unexpected errors rethrow.
6. Upstream calls go through the client adapter — extend it if the endpoint/subcommand is missing; never fetch/spawn directly in the handler.
7. Add unit tests (definition, nominal path, expected-error path) and extend the integration test if the tool ships in a default entry point.
8. Update `CAPABILITIES.md`, then run `npm run verify` and fix all failures.
