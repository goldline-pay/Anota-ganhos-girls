import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// Tabela de usuários usando OAuth do Manus
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  nickname: varchar("nickname", { length: 50 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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

// Tabela de Tops (períodos de 7 dias)
export const tops = mysqlTable("tops", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tabela de snapshots semanais agregados por usuária
export const weeklySnapshots = mysqlTable("weekly_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekStart: varchar("weekStart", { length: 10 }).notNull(), // YYYY-MM-DD
  weekEnd: varchar("weekEnd", { length: 10 }).notNull(), // YYYY-MM-DD
  totalGross: int("totalGross").notNull(), // em centavos, soma de todos os ganhos
  totalNet: int("totalNet").default(0).notNull(), // em centavos, se houver lógica de custos
  daysWorked: int("daysWorked").notNull(), // 1-7
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;
export type Top = typeof tops.$inferSelect;
export type InsertTop = typeof tops.$inferInsert;
export type WeeklySnapshot = typeof weeklySnapshots.$inferSelect;
export type InsertWeeklySnapshot = typeof weeklySnapshots.$inferInsert;
