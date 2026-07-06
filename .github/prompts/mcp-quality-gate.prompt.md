---
mode: agent
description: Run the MCP template quality gate and fix everything it finds.
---

# MCP Quality Gate

Run the full quality pipeline for this MCP server and bring it to green.

## Steps

1. Run `npm run verify` (typecheck, lint, tests, 400-line file-size guard).
2. Fix every failure at the root cause — do not suppress lint rules, loosen `tsconfig`, delete failing tests, or raise the file-size limit.
3. Audit conformance beyond the pipeline:
   - Every tool has all four annotations, an `outputSchema` from `buildOutputSchema`, and a WHAT / WHEN TO USE / BEST PRACTICES / AVOID description.
   - Every handler returns via `formatData` / `formatList` / `formatToolOutput` (search for hand-rolled `content:` payloads).
   - Destructive tools require a literal confirmation token.
   - `CAPABILITIES.md` lists every registered tool with matching annotations.
   - `.env.example` covers every env var read in `src/config/config.loader.ts`.
   - No secrets, tokens, or PII in code, tests, or fixtures.
4. Re-run `npm run verify` after fixes.
5. Report: what failed, what you changed, and any conformance gaps you could not fix automatically.
