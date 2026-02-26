export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: "text/markdown";
}

const CAPABILITIES_URI = "docs://capabilities";

export class ResourceProvider {
  public list(): ResourceDefinition[] {
    return [
      {
        uri: CAPABILITIES_URI,
        name: "MCP Template Capabilities",
        description: "Static capability summary for quick agent orientation",
        mimeType: "text/markdown"
      }
    ];
  }

  public read(uri: string): string {
    if (uri !== CAPABILITIES_URI) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }

    return [
      "# MCP Template Capabilities",
      "",
      "- Atomic tools only",
      "- Structured output contract",
      "- Zod validation at tool boundary",
      "- Config validation at startup"
    ].join("\n");
  }
}