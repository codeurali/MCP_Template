---
name: mcp-builder
description: Build and maintain Model Context Protocol servers using deterministic architecture, atomic tools, strict input validation, structured outputs, and observable execution. Use when creating a new MCP server, adding or refactoring tools, designing tool schemas, adding MCP tests, or preparing an MCP package for publication.
---

# MCP Builder Skill

Read `agents/shared/mcp-builder-core.md` first and apply all constraints.

## Execute This Workflow

1. Model domains and atomic tool boundaries before writing code.
2. Create one `[domain].tools.ts` module per domain.
3. Validate inputs with Zod at handler entry.
4. Keep API/auth/retry logic in the client adapter.
5. Return structured output using shared output helpers.
6. Add tests for definitions, annotations, and error paths.
7. Keep files under 400 lines.
8. Run `npm run verify` before finishing.

## Tool Authoring Rules

- Include the four required annotations on every tool.
- Follow description format: WHAT, WHEN TO USE, BEST PRACTICES, AVOID.
- Keep schemas minimal and focused.
- Reject hidden routing and implicit fallback behavior.

## Error Handling Rules

- Let Zod errors surface for invalid arguments.
- Return structured recoverable responses for expected errors.
- Throw unexpected failures to preserve observability.

## Publication Gate

Do not publish until all are true:

- Build, lint, typecheck, and tests pass.
- Tool catalogue is updated.
- Config schema and env examples are consistent.
- No secrets are committed.