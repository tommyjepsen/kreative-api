import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workflows } from "./workflow.entity";

// Define node types enum
export const nodeTypes = [
  "prompt",
  "generate-image",
  "remove-background",
  "upload-image",
] as const;

export type NodeType = (typeof nodeTypes)[number];

export const workflowNodes = sqliteTable("workflowNodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  workflowId: text("workflowId")
    .notNull()
    .references(() => workflows.id),
  title: text("title", { length: 255 }),
  type: text("type", { length: 255, enum: nodeTypes })
    .notNull()
    .default("prompt"),
  data: text("data", { mode: "json" }),
  inputWorkflowNodeId: text("inputWorkflowNodeId"),
  output: text("output", { mode: "json" }),
  position: integer("position").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

//Relations
export const workflowNodesRelations = relations(workflowNodes, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowNodes.workflowId],
    references: [workflows.id],
  }),
}));
