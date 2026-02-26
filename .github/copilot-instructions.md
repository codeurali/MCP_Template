# GitHub Copilot Instructions - MCP Builder

Use `agents/shared/mcp-builder-core.md` as the canonical rule set.

## Coding Priorities

- Build deterministic MCP servers.
- Keep one action per tool.
- Validate all input using Zod at handler boundaries.
- Return structured tool outputs (`summary`, `data`, optional `suggestions`, `warnings`).
- Keep `server.ts` focused on transport and registration wiring.

## Tool Definition Standard

Each tool must include:

- Description with WHAT / WHEN TO USE / BEST PRACTICES / AVOID.
- `annotations.readOnlyHint`
- `annotations.destructiveHint`
- `annotations.idempotentHint`
- `annotations.openWorldHint`

## Quality Gate Before Completion

Run and pass:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run check:file-size`