import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { projects } from "./project.entity";

export const companiesTable = sqliteTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  companyName: text("companyName", { length: 255 }).notNull(),
  companyDescription: text("companyDescription"),
  companyImageUrl: text("companyImageUrl"),
  companyUrl: text("companyUrl", { length: 512 }).notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const companiesRelations = relations(companiesTable, ({ many }) => ({
  projectLinks: many(projectToCompanyTable),
}));

export const projectToCompanyTable = sqliteTable("projectToCompany", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id),
  companyId: text("companyId")
    .notNull()
    .references(() => companiesTable.id),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const projectToCompanyRelations = relations(
  projectToCompanyTable,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectToCompanyTable.projectId],
      references: [projects.id],
    }),
    company: one(companiesTable, {
      fields: [projectToCompanyTable.companyId],
      references: [companiesTable.id],
    }),
  })
);

