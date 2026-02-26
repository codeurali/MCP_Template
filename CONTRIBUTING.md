# Contributing

This repository is a universal MCP template and guide. Contributions must improve the reusable base, not implement business-specific MCP servers.

## Scope of Contributions

Accepted contribution types:

1. Improve template architecture and scaffolding.
2. Improve golden-rules enforcement and safety defaults.
3. Improve agent guidance files (`SKILL.md`, `CLAUDE.md`, Copilot instructions, shared rules).
4. Improve developer experience (docs, examples, tests, scripts, linting, packaging).
5. Improve interoperability across MCP clients.

Out of scope for this repository:

1. Add domain-specific tools for a specific product or company.
2. Turn this repo into a full production MCP implementation for one use case.
3. Add features that conflict with determinism, observability, or explicitness rules.

## Example Tools Policy

The tools in `src/tools/example.tools.ts` are educational reference tools.

Use them to:

1. Demonstrate implementation patterns.
2. Validate conventions (schemas, descriptions, annotations, outputs).
3. Provide copy-adapt examples for downstream MCP projects.

Do not expand them into a domain product surface. Keep examples minimal and pedagogical.

## Before Opening a PR

Run:

```bash
npm run verify
```

The PR must keep:

- `server.ts` as wiring only
- no secrets in repository files
- files under `400` lines for source/tests/scripts
- deterministic behaviour (no internal LLM calls in tool handlers)
