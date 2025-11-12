import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { workflows } from "./workflow.entity";

// Define node types enum
export const nodeTypes = [
  "prompt",
  "generate-image",
  "remove-background",
  "upload-image",
  "image-input",
] as const;

export type NodeType = (typeof nodeTypes)[number];

export const workflowNodes = pgTable("workflowNodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  workflowId: text("workflowId")
    .notNull()
    .references(() => workflows.id),
  title: varchar("title", { length: 255 }),
  type: varchar("type", { length: 255 })
    .notNull()
    .default("prompt"),
  data: jsonb("data"),
  inputWorkflowNodeId: text("inputWorkflowNodeId"),
  output: jsonb("output"),
  position: integer("position").default(0),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
});

//Relations
export const workflowNodesRelations = relations(workflowNodes, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowNodes.workflowId],
    references: [workflows.id],
  }),
}));
