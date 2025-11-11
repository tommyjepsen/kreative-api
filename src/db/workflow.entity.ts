import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { workflowNodes } from "./workflownodes.entity";

export const workflows = sqliteTable("workflows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cloudflareWorkflowId: text("cloudflareWorkflowId", { length: 255 }).notNull(),
  title: text("title", { length: 255 }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

//Relations
export const workflowRelations = relations(workflows, ({ many }) => ({
  workflowNodes: many(workflowNodes, { relationName: "workflowNodes" }),
}));
