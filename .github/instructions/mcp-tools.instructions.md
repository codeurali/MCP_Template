---
applyTo: "src/tools/**/*.ts"
description: Authoring rules for MCP tool modules.
---

# Tool Module Rules

- One `[domain].tools.ts` per domain: exported `ToolDefinition[]` plus one handler with a switch per tool name. Unknown names throw.
- Parse arguments with Zod as the first statement of every case; never touch raw `args` afterwards. Do not catch `ZodError` — the registry converts it into a tool execution error.
- Descriptions follow WHAT / WHEN TO USE / BEST PRACTICES / AVOID, with the alternative tool named in AVOID.
- Every definition sets all four annotations and an `outputSchema` built with `buildOutputSchema`.
- Return only via `formatData` / `formatList` / `formatToolOutput`. Expected upstream errors (e.g. `NotFoundError`) become structured recoverable responses with an `error` code in `data`; unexpected errors rethrow.
- No network or process calls here — go through the client adapter passed to the handler.
- Destructive tools require a literal confirmation field (`z.literal("DELETE")` pattern) and `destructiveHint: true`.
- Keep JSON `inputSchema` an exact mirror of the Zod schema, with `additionalProperties: false`.
