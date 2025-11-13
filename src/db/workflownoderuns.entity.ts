import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { workflowNodes } from "./workflownodes.entity";
import { workflows } from "./workflow.entity";

export const workflowNodeRuns = pgTable("workflowNodeRuns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  workflowNodeId: text("workflowNodeId")
    .notNull()
    .references(() => workflowNodes.id),
  workflowId: text("workflowId")
    .notNull()
    .references(() => workflows.id),
  status: varchar("status", { length: 255 }).notNull().default("pending"),
  output: jsonb("output"),
  error: jsonb("error"),
  finishedAt: timestamp("finishedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

//Relations
export const workflowNodeRunsRelations = relations(
  workflowNodeRuns,
  ({ one }) => ({
    workflowNode: one(workflowNodes, {
      fields: [workflowNodeRuns.workflowNodeId],
      references: [workflowNodes.id],
    }),
    workflow: one(workflows, {
      fields: [workflowNodeRuns.workflowId],
      references: [workflows.id],
    }),
  })
);
