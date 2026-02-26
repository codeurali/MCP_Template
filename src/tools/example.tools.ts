import { z } from "zod";
import { NotFoundError, type ExampleApiClient } from "../example-client/client.js";
import { formatData, formatList } from "./output.utils.js";
import type { ToolDefinition, ToolResult } from "./tool-registry.js";

const GetThingSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
  fields: z.array(z.string().min(1)).max(25).optional()
});

const ListThingsSchema = z.object({
  filter: z.string().min(1).optional(),
  top: z.number().int().min(1).max(100).default(25)
});

const DeleteThingSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
  confirmation: z.literal("DELETE")
});

export const exampleTools: ToolDefinition[] = [
  {
    name: "example_get_thing",
    description: [
      "Retrieve a single thing by UUID.",
      "WHEN TO USE: Use when you already know the exact thing ID and need focused fields.",
      "BEST PRACTICES: Pass fields to reduce payload and keep responses small.",
      "AVOID: Do not use for discovery; use example_list_things instead."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "UUID of the target thing"
        },
        fields: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of fields to return"
        }
      },
      required: ["id"],
      additionalProperties: false
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  {
    name: "example_list_things",
    description: [
      "List things with optional filtering.",
      "WHEN TO USE: Use for exploration, searching, and pagination-friendly discovery.",
      "BEST PRACTICES: Keep top small and use filter to reduce token usage.",
      "AVOID: Do not use when an exact UUID is available; use example_get_thing."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Optional filter expression"
        },
        top: {
          type: "number",
          description: "Maximum number of items (1-100, default 25)"
        }
      },
      required: [],
      additionalProperties: false
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true
    }
  },
  {
    name: "example_delete_thing",
    description: [
      "Delete a single thing by UUID.",
      "WHEN TO USE: Use only when deletion is explicitly requested and the target ID is confirmed.",
      "BEST PRACTICES: Always run example_get_thing before deleting and require confirmation='DELETE'.",
      "AVOID: Do not use for status changes or soft updates; use a dedicated update tool."
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "UUID of the thing to delete"
        },
        confirmation: {
          type: "string",
          enum: ["DELETE"],
          description: "Explicit confirmation token required for destructive action"
        }
      },
      required: ["id", "confirmation"],
      additionalProperties: false
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: true
    }
  }
];

export async function handleExampleTool(
  name: string,
  args: unknown,
  client: ExampleApiClient
): Promise<ToolResult> {
  switch (name) {
    case "example_get_thing": {
      const { id, fields } = GetThingSchema.parse(args);

      try {
        const thing = await client.getThing(id, fields);
        return formatData(
          `Thing ${id} retrieved successfully.`,
          thing,
          ["Use example_list_things to discover related records."]
        );
      } catch (error) {
        if (error instanceof NotFoundError) {
          return formatData(
            `Thing ${id} was not found.`,
            { error: "NOT_FOUND", id },
            ["Run example_list_things to discover valid IDs before retrying."]
          );
        }

        throw error;
      }
    }

    case "example_list_things": {
      const { filter, top } = ListThingsSchema.parse(args ?? {});
      const things = await client.listThings({ filter, top });
      return formatList("things", things, [
        "Use example_get_thing with one ID from this list for details."
      ]);
    }

    case "example_delete_thing": {
      const { id } = DeleteThingSchema.parse(args);

      try {
        await client.deleteThing(id);
        return formatData(
          `Thing ${id} deleted successfully.`,
          { id, deleted: true },
          ["Deletion is irreversible. Confirm no dependent workflows need this record."]
        );
      } catch (error) {
        if (error instanceof NotFoundError) {
          return formatData(
            `Thing ${id} was not found; nothing was deleted.`,
            { error: "NOT_FOUND", id, deleted: false },
            ["Use example_list_things to verify available IDs before retrying."]
          );
        }

        throw error;
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
