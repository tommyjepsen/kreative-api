import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user.entity";
import { projectToCompanyTable } from "./company.entity";

export const projects: any = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  projectName: text("projectName", { length: 255 }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
//Many users can have many projects
export const userToProject = sqliteTable("userToProject", {
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id),
});

export const userToProjectRelations = relations(userToProject, ({ one }) => ({
  user: one(users, {
    fields: [userToProject.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [userToProject.projectId],
    references: [projects.id],
  }),
}));

export const projectRelations = relations(projects, ({ many }) => ({
  userToProjects: many(userToProject),
  projectToCompanies: many(projectToCompanyTable),
}));
