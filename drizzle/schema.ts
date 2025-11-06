import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// Tabela de usuários usando OAuth do Manus
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Tabela de ganhos - estrutura simples
export const earnings = mysqlTable("earnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // em centavos
  currency: varchar("currency", { length: 3 }).notNull(), // GBP, EUR, USD
  duration: int("duration").notNull(), // minutos
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;
