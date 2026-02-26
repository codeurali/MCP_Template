# Codex Agent Profile

This profile mirrors `SKILL.md` and is convenient for prompt injection into tool UIs.

1. Build deterministic MCP servers only.
2. Keep tools atomic and explicit.
3. Reject hidden orchestration and internal LLM calls.
4. Validate config at startup and args at tool boundaries.
5. Return structured JSON output contract every time.
6. Keep each file under 400 lines.
7. Require explicit confirmation for destructive actions.