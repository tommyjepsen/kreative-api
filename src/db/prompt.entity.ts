import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { projects } from "./project.entity";

export const promptsTable = sqliteTable("prompts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const promptsRelations = relations(promptsTable, ({ one }) => ({
  project: one(projects, {
    fields: [promptsTable.projectId],
    references: [projects.id],
  }),
}));

export const promptRunStateTable = sqliteTable("promptRunState", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id),
  model: text("model", { length: 255 }).notNull(),
  type: text("type", { length: 255 }).notNull(),
  payload: text("payload"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const promptRunStateRelations = relations(
  promptRunStateTable,
  ({ one }) => ({
    project: one(projects, {
      fields: [promptRunStateTable.projectId],
      references: [projects.id],
    }),
  })
);

