# MCP Template

Universal starter for building Model Context Protocol (MCP) servers that stay deterministic, debuggable, and agent-friendly. Aligned with the current MCP specification (structured outputs, output schemas, Streamable HTTP, DNS-rebinding protection).

## 2-Minute Quickstart

```bash
npm install
cp .env.example .env
npm run verify
npm run build
```

Then implement your first domain:

1. Replace [src/tools/example.tools.ts](src/tools/example.tools.ts) with your domain tools.
2. Replace [src/example-client/client.ts](src/example-client/client.ts) with your API adapter (or [src/cli-client/cli-client.ts](src/cli-client/cli-client.ts) for a CLI-backed server).
3. Update [CAPABILITIES.md](CAPABILITIES.md) and rerun `npm run verify`.

Prefer an agentic workflow? Open this repo in VS Code with GitHub Copilot and run the `/new-mcp-server` prompt — see [Copilot Agentic Workflow](#copilot-agentic-workflow).

## What This Template Gives You

- Three ready entry points sharing one server factory:
  - [src/server.ts](src/server.ts) — stdio transport, HTTP API upstream
  - [src/cli-server.ts](src/cli-server.ts) — stdio transport, local CLI upstream
  - [src/http-server.ts](src/http-server.ts) — Streamable HTTP transport (stateless, DNS-rebinding protection)
- Layered architecture (`entry point -> server factory -> registry -> tools -> client adapter`)
- Strict validation with Zod for config and tool inputs; invalid arguments come back as tool execution errors (`isError: true`) the model can self-correct from
- Structured output contract (`summary`, `data`, optional `suggestions`, `warnings`) returned as both `structuredContent` and text, with a declared `outputSchema` per tool
- Tool annotations standard for safety and discoverability (all four hints on every tool)
- MCP resource (`docs://capabilities`) for quick agent orientation
- Unit tests plus in-memory client/server integration tests that assert spec conformance
- File-size guard (`400` lines max)
- Multi-assistant agent pack (GitHub Copilot agentic workflow, Codex, Claude)

## Golden Rules to File Mapping

| Golden Rule | Primary Enforcement | Notes |
|---|---|---|
| 1. Prefer Atomic Tools | [src/tools/example.tools.ts](src/tools/example.tools.ts) | One action per tool name and switch case |
| 2. Do NOT Hide Orchestration | [src/server-factory.ts](src/server-factory.ts), [src/tools/tool-registry.ts](src/tools/tool-registry.ts) | Dispatch is explicit and visible |
| 3. Avoid Over-Aggregation | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Separate get, list, delete |
| 4. Keep Inputs Minimal | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Focused schemas per tool |
| 5. Prefer Explicitness | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Explicit parameters and confirmation token |
| 6. Maintain Observability | [src/tools/output.utils.ts](src/tools/output.utils.ts) | Structured summaries and data |
| 7. Use Structured Outputs | [src/tools/output.utils.ts](src/tools/output.utils.ts) | `structuredContent` + `outputSchema` on every tool |
| 8. Add Tool Metadata | [src/tools/example.tools.ts](src/tools/example.tools.ts) | All four annotations required |
| 9. Limit Destructive Operations | [src/tools/example.tools.ts](src/tools/example.tools.ts) | `example_delete_thing` requires `confirmation: "DELETE"` |
| 10. Design for Large Tool Sets | [src/tools/tool-registry.ts](src/tools/tool-registry.ts) | Registry scales by name lookup |
| 11. Guide, Do Not Control | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Description formula and suggestions |
| 12. Keep Determinism | [src/tools/example.tools.ts](src/tools/example.tools.ts), [src/example-client/client.ts](src/example-client/client.ts) | No hidden LLM calls or randomness |
| 13. Avoid Smart Routers | [src/server-factory.ts](src/server-factory.ts), [src/tools/tool-registry.ts](src/tools/tool-registry.ts) | No implicit routing logic |
| 14. Respect LLM Limitations | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Small schemas, bounded list sizes |
| 15. Optimise for Debuggability | [tests/unit/example.tools.test.ts](tests/unit/example.tools.test.ts), [tests/integration/server-factory.integration.test.ts](tests/integration/server-factory.integration.test.ts) | Direct tests for contracts and spec conformance |

## Included MCP Tools

API-backed server ([src/server.ts](src/server.ts), [src/http-server.ts](src/http-server.ts)):

- `example_get_thing`
- `example_list_things`
- `example_delete_thing` (destructive, explicit confirmation required)

CLI-backed server ([src/cli-server.ts](src/cli-server.ts)):

- `cli_echo` (smoke test for the CLI transport — replace with your domain tools)

See [CAPABILITIES.md](CAPABILITIES.md) for complete descriptions and annotations.

## Entry Points and Transports

| Entry point | Transport | Upstream | Run |
|---|---|---|---|
| [src/server.ts](src/server.ts) | stdio | HTTP API via [src/example-client/client.ts](src/example-client/client.ts) | `node dist/server.js` |
| [src/cli-server.ts](src/cli-server.ts) | stdio | Local CLI via [src/cli-client/cli-client.ts](src/cli-client/cli-client.ts) | `node dist/cli-server.js` |
| [src/http-server.ts](src/http-server.ts) | Streamable HTTP (`/mcp`) | HTTP API | `node dist/http-server.js` |

All three delegate to [src/server-factory.ts](src/server-factory.ts) (`createMcpServer`); entry points contain transport wiring only. Configuration is environment-driven and validated at startup — see [.env.example](.env.example) for every variable.

## Copilot Agentic Workflow

The template ships a full GitHub Copilot workflow so an agent can generate a new MCP server for you:

| Asset | Location | Use |
|---|---|---|
| Repo instructions | [.github/copilot-instructions.md](.github/copilot-instructions.md) | Always-on rules for any Copilot work in this repo |
| Custom agent | [.github/agents/mcp-builder.agent.md](.github/agents/mcp-builder.agent.md) | Select the `mcp-builder` agent in Copilot Chat for guided Discover → Implement → Test → Verify builds |
| Prompt: new server | [.github/prompts/new-mcp-server.prompt.md](.github/prompts/new-mcp-server.prompt.md) | `/new-mcp-server` — generate a full server from a domain description |
| Prompt: add tool | [.github/prompts/add-mcp-tool.prompt.md](.github/prompts/add-mcp-tool.prompt.md) | `/add-mcp-tool` — add one atomic tool with schema, annotations, and tests |
| Prompt: quality gate | [.github/prompts/mcp-quality-gate.prompt.md](.github/prompts/mcp-quality-gate.prompt.md) | `/mcp-quality-gate` — run the pipeline and fix findings |
| Scoped instructions | [.github/instructions/](.github/instructions/) | Auto-applied rules for `src/tools/**` and `tests/**` |
| Agent skill | [.github/skills/mcp-builder/SKILL.md](.github/skills/mcp-builder/SKILL.md) | Skill for the Copilot coding agent / CLI |

Typical flow: fork or clone the template → open Copilot Chat in agent mode → run `/new-mcp-server` with your domain description → review the proposed tool map → let the agent implement and finish with `npm run verify`.

## Universal Agent Pack

All assistants share one canonical rule set: [agents/shared/mcp-builder-core.md](agents/shared/mcp-builder-core.md).

- GitHub Copilot: [.github/copilot-instructions.md](.github/copilot-instructions.md) plus the [agentic workflow](#copilot-agentic-workflow) above
- Claude (Claude Code / Claude Desktop): [CLAUDE.md](CLAUDE.md)
- Codex skill: [SKILL.md](SKILL.md)
- OpenAI skill metadata: [agents/openai.yaml](agents/openai.yaml)
- Short profiles: [agents/claude/profile.md](agents/claude/profile.md), [agents/codex/profile.md](agents/codex/profile.md), [agents/copilot/profile.md](agents/copilot/profile.md)

## Client Compatibility

| Client | Transport | Status | Notes |
|---|---|---|---|
| Codex | stdio | Ready | Uses `SKILL.md` and can call the built server binary |
| GitHub Copilot | stdio / Streamable HTTP | Ready | Reads `.github/copilot-instructions.md`; agentic workflow included |
| Claude Desktop / Claude Code | stdio | Ready | Uses `CLAUDE.md` guidance; add server in Claude config |
| Cursor | stdio | Ready | Works with MCP-compatible local server registration |
| VS Code MCP-compatible clients | stdio / Streamable HTTP | Ready | `node dist/server.js` or `http://127.0.0.1:3000/mcp` |

Note: Client UI support for metadata hints (annotations, confirmations, `structuredContent`) varies by product version.

## Commands

- `npm run build`: compile TypeScript
- `npm run typecheck`: strict compile check
- `npm run lint`: lint code
- `npm run test`: run tests
- `npm run check:file-size`: enforce max `400` lines
- `npm run verify`: run full quality pipeline

## Project Structure

```text
src/
  server.ts            stdio entry point (API upstream)
  cli-server.ts        stdio entry point (CLI upstream)
  http-server.ts       Streamable HTTP entry point
  server-factory.ts    shared server assembly (createMcpServer)
  config/              Zod-validated env config
  auth/                token auth provider
  tools/               tool definitions, registry, output helpers
  example-client/      HTTP API adapter
  cli-client/          spawned-CLI adapter
  resources/           docs://capabilities resource
tests/
  unit/
  integration/
scripts/
.github/               Copilot agentic workflow (agent, prompts, instructions, skill)
```

## Contribution Workflow

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution rules focused on improving the template, guide, and assistant layer.
