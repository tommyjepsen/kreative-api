import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { workflowNodes } from "./workflownodes.entity";

export const workflows = pgTable("workflows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cloudflareWorkflowId: varchar("cloudflareWorkflowId", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
});

//Relations
export const workflowRelations = relations(workflows, ({ many }) => ({
  workflowNodes: many(workflowNodes, { relationName: "workflowNodes" }),
}));
