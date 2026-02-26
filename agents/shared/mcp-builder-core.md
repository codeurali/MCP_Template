# MCP Builder Core Rules

## Objective

Create and maintain MCP servers that remain deterministic, debuggable, and agent-friendly.

## Non-Negotiable Constraints

- Keep each tool atomic: one tool, one action.
- Avoid hidden orchestration inside tools.
- Validate all tool inputs at boundaries with Zod.
- Return structured output with `summary` and `data` on every tool.
- Set all four annotations explicitly on every tool.
- Keep `server.ts` as wiring only; no business logic.
- Keep secrets in environment variables only.
- Prefer explicit parameters over implicit behavior.

## Implementation Workflow

1. Define the tool map by domain with atomic actions.
2. Implement schemas, tool definitions, and handlers per domain module.
3. Route tools through a registry with duplicate detection.
4. Keep upstream API logic in a client adapter, not in handlers.
5. Add unit tests for definitions and handler branches.
6. Add integration tests for dispatch and output contract.
7. Run lint, typecheck, tests, and line-count guard before publish.

## Output Contract

Every handler must return JSON with this shape:

```json
{
  "summary": "one-line result",
  "data": {},
  "suggestions": [],
  "warnings": []
}
```

## Tool Description Formula

Write descriptions in this order:

1. WHAT
2. WHEN TO USE
3. BEST PRACTICES
4. AVOID (with alternative tool name)

## Safety

- Require explicit confirmation before destructive operations.
- Never hide side effects.
- Never run LLM calls inside MCP tools.
- Never swallow unexpected errors.