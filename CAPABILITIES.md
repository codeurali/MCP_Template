# Capabilities

## Tools

### `example_get_thing`

- WHAT: Retrieve one thing by UUID.
- WHEN TO USE: When exact ID is known.
- BEST PRACTICES: Use `fields` to reduce payload size.
- AVOID: Do not use for discovery; call `example_list_things`.
- Annotations:
  - `readOnlyHint`: `true`
  - `destructiveHint`: `false`
  - `idempotentHint`: `true`
  - `openWorldHint`: `true`

### `example_list_things`

- WHAT: List things with optional filtering and paging.
- WHEN TO USE: For discovery, search, and selection.
- BEST PRACTICES: Keep `top` small and apply `filter`.
- AVOID: Do not use if ID is known; call `example_get_thing`.
- Annotations:
  - `readOnlyHint`: `true`
  - `destructiveHint`: `false`
  - `idempotentHint`: `false`
  - `openWorldHint`: `true`

### `example_delete_thing`

- WHAT: Delete one thing by UUID.
- WHEN TO USE: Only when user intent is explicit and deletion is required.
- BEST PRACTICES: Require `confirmation: "DELETE"` and verify target with `example_get_thing`.
- AVOID: Do not use for updates or status transitions.
- Annotations:
  - `readOnlyHint`: `false`
  - `destructiveHint`: `true`
  - `idempotentHint`: `false`
  - `openWorldHint`: `true`

## Output Contract

Every tool returns:

```json
{
  "summary": "...",
  "data": {},
  "suggestions": [],
  "warnings": []
}
```

- `summary` and `data` are always present.
- `suggestions` and `warnings` are optional.
- Never return tokens, secrets, passwords, or PII.
