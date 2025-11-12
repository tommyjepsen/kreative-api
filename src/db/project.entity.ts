import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user.entity";
import { projectToCompanyTable } from "./company.entity";

export const projects: any = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
});
//Many users can have many projects
export const userToProject = pgTable("userToProject", {
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
