---
applyTo: "tests/**/*.ts"
description: Testing rules for MCP server modules.
---

# Test Rules

- Unit tests (per domain module): tool definitions expose all four annotations, `inputSchema`, and `outputSchema`; nominal handler paths; expected-error paths (structured response with an `error` code); unknown tool name throws.
- Integration tests: go through `createMcpServer` with `InMemoryTransport` and a real MCP `Client` (see `tests/integration/server-factory.integration.test.ts`). The SDK client validates `structuredContent` against the declared `outputSchema`, so a passing call is a conformance check.
- Always cover invalid input: expect `isError: true` and a `VALIDATION_ERROR` payload, not a thrown protocol error.
- Stub upstream clients with plain objects; never hit real APIs or spawn real binaries in tests.
- No secrets or PII in fixtures.
