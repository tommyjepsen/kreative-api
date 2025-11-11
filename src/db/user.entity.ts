import { randomUUID } from "crypto";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { projects } from "./project.entity";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name", { length: 255 }).notNull(),
  password: text("password", { length: 255 }).notNull(),
  projectSelectedId: text("projectSelectedId").references(() => projects.id),
  email: text("email", { length: 255 }).notNull().unique(),
  stripeCustomerId: text("stripeCustomerId", { length: 255 }),
  stripePaymentLink: text("stripePaymentLink", { length: 255 }),
  testUser: integer("testUser", { mode: "boolean" }).notNull().default(true),
  subscription: text("subscription", { length: 255 }).notNull().default("free"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userRelations = relations(users, ({ one }) => ({
  projectSelected: one(projects, {
    fields: [users.projectSelectedId],
    references: [projects.id],
  }),
}));
