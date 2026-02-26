# MCP Template

Universal starter MCP servers.

## 2-Minute Quickstart

```bash
npm install
cp .env.example .env
npm run verify
npm run build
```

Then implement your first domain:

1. Replace [src/tools/example.tools.ts](src/tools/example.tools.ts) with your domain tools.
2. Replace [src/example-client/client.ts](src/example-client/client.ts) with your API adapter.
3. Update [CAPABILITIES.md](CAPABILITIES.md) and rerun `npm run verify`.

## What This Template Gives You

- Layered architecture (`server -> registry -> tools -> client`)
- Strict validation with Zod for config and tool inputs
- Structured output contract (`summary`, `data`, optional `suggestions`, `warnings`)
- Tool annotations standards for safety and discoverability
- Unit and integration tests
- File-size guard (`400` lines max)
- Multi-assistant agent pack (`Codex`, `GitHub Copilot`, `Claude`)

## Golden Rules to File Mapping

| Golden Rule | Primary Enforcement | Notes |
|---|---|---|
| 1. Prefer Atomic Tools | [src/tools/example.tools.ts](src/tools/example.tools.ts) | One action per tool name and switch case |
| 2. Do NOT Hide Orchestration | [src/server.ts](src/server.ts), [src/tools/tool-registry.ts](src/tools/tool-registry.ts) | Dispatch is explicit and visible |
| 3. Avoid Over-Aggregation | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Separate get, list, delete |
| 4. Keep Inputs Minimal | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Focused schemas per tool |
| 5. Prefer Explicitness | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Explicit parameters and confirmation token |
| 6. Maintain Observability | [src/tools/output.utils.ts](src/tools/output.utils.ts) | Structured summaries and data |
| 7. Use Structured Outputs | [src/tools/output.utils.ts](src/tools/output.utils.ts) | Single output contract helper |
| 8. Add Tool Metadata | [src/tools/example.tools.ts](src/tools/example.tools.ts) | All four annotations required |
| 9. Limit Destructive Operations | [src/tools/example.tools.ts](src/tools/example.tools.ts) | `example_delete_thing` requires `confirmation: "DELETE"` |
| 10. Design for Large Tool Sets | [src/tools/tool-registry.ts](src/tools/tool-registry.ts) | Registry scales by name lookup |
| 11. Guide, Do Not Control | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Description formula and suggestions |
| 12. Keep Determinism | [src/tools/example.tools.ts](src/tools/example.tools.ts), [src/example-client/client.ts](src/example-client/client.ts) | No hidden LLM calls or randomness |
| 13. Avoid Smart Routers | [src/server.ts](src/server.ts), [src/tools/tool-registry.ts](src/tools/tool-registry.ts) | No implicit routing logic |
| 14. Respect LLM Limitations | [src/tools/example.tools.ts](src/tools/example.tools.ts) | Small schemas, bounded list sizes |
| 15. Optimise for Debuggability | [tests/unit/example.tools.test.ts](tests/unit/example.tools.test.ts), [tests/integration/tool-pipeline.integration.test.ts](tests/integration/tool-pipeline.integration.test.ts) | Direct tests for contracts and branches |

## Included MCP Tools

- `example_get_thing`
- `example_list_things`
- `example_delete_thing` (destructive, explicit confirmation required)

See [CAPABILITIES.md](CAPABILITIES.md) for complete descriptions and annotations.

## Universal Agent Pack

- Codex skill: [SKILL.md](SKILL.md)
- OpenAI skill metadata: [agents/openai.yaml](agents/openai.yaml)
- GitHub Copilot instructions: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Claude instructions: [CLAUDE.md](CLAUDE.md)
- Shared policy source: [agents/shared/mcp-builder-core.md](agents/shared/mcp-builder-core.md)

## Client Compatibility

Validated on **2026-02-27**.

| Client | Transport | Status | Notes |
|---|---|---|---|
| Codex | Stdio | Ready | Uses `SKILL.md` and can call the built server binary |
| GitHub Copilot | MCP/Tool integration | Ready | Reads `.github/copilot-instructions.md` for behaviour |
| Claude Desktop | Stdio | Ready | Uses `CLAUDE.md` style guidance; add server in Claude config |
| Cursor | Stdio | Ready | Works with MCP-compatible local server registration |
| VS Code MCP-compatible clients | Stdio | Ready | Use `node dist/server.js` entrypoint |

Note: Client UI support for metadata hints (annotations, confirmations) varies by product version.

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
  server.ts
  config/
  auth/
  tools/
  example-client/
  resources/
tests/
  unit/
  integration/
scripts/
```

## Contribution Workflow

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution rules focused on improving the template, guide, and assistant layer.
