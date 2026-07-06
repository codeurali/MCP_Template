# Changelog

## Unreleased

- Modernised to current MCP spec best practices: `structuredContent` + `outputSchema` on every tool, Zod validation failures returned as tool execution errors (SEP-1303), Streamable HTTP entry point with DNS-rebinding protection, `docs://capabilities` resource wired, shared `createMcpServer` factory across all three entry points.
- Added CLI-backed stdio entry point (`cli-server.ts`) with `cli_echo` smoke-test tool.
- Removed the Windows-specific `explorer_open` POC tool.
- Renamed CLI server binary to `mcp-template-cli-server` and exposed `mcp-template-http-server`.
- Added GitHub Copilot agentic workflow: custom agent, `/new-mcp-server`, `/add-mcp-tool`, `/mcp-quality-gate` prompts, scoped instructions, and an agent skill under `.github/`.
- Documented HTTP transport env vars in `.env.example`; refreshed README, CAPABILITIES, and agent pack docs.

## 0.1.0 - 2026-02-26

- Initial community MCP template scaffold.
- Added deterministic MCP server skeleton with tool registry.
- Added sample atomic tools, tests, linting, and publication helpers.
- Added multi-assistant agent pack (Codex, GitHub Copilot, Claude).