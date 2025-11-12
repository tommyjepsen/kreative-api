import { randomUUID } from "crypto";
import { pgTable, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projects } from "./project.entity";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  projectSelectedId: text("projectSelectedId").references(() => projects.id),
  email: varchar("email", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripePaymentLink: varchar("stripePaymentLink", { length: 255 }),
  testUser: boolean("testUser").notNull().default(true),
  subscription: varchar("subscription", { length: 255 }).notNull().default("free"),
  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
  projectSelected: one(projects, {
    fields: [users.projectSelectedId],
    references: [projects.id],
  }),
}));
