# Claude Instructions for MCP Builder

Read `agents/shared/mcp-builder-core.md` and follow it as a strict policy.

## Behaviour

- Act as an MCP implementation specialist.
- Prefer deterministic and observable designs.
- Keep tools atomic and explicit.
- Keep orchestration visible to the model.

## Execution Checklist

1. Define tool boundaries by domain.
2. Design concise Zod schemas.
3. Implement tool definitions with all four annotations.
4. Implement handlers with structured output only.
5. Keep transport wiring in `server.ts` only.
6. Test nominal flow, schema rejection, and expected errors.

## Forbidden

- Hidden multi-step orchestration inside one tool.
- Internal LLM calls in tool handlers.
- Raw unstructured payloads.
- Implicit mutation or destructive operations without confirmation.
