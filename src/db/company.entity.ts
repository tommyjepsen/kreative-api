import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { projects } from "./project.entity";

export const companiesTable = pgTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyDescription: text("companyDescription"),
  companyImageUrl: text("companyImageUrl"),
  companyUrl: varchar("companyUrl", { length: 512 }).notNull().unique(),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
});

export const companiesRelations = relations(companiesTable, ({ many }) => ({
  projectLinks: many(projectToCompanyTable),
}));

export const projectToCompanyTable = pgTable("projectToCompany", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id),
  companyId: text("companyId")
    .notNull()
    .references(() => companiesTable.id),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
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

