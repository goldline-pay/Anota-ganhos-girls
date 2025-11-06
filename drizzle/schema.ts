import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime, date } from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários com autenticação própria (email/senha)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Tabela de anotações de ganhos
 * Valores armazenados em centavos para evitar problemas de precisão
 */
export const earnings = mysqlTable("earnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Valores em centavos (ex: 150.50 EUR = 15050)
  gbpAmount: int("gbpAmount").default(0).notNull(),
  eurAmount: int("eurAmount").default(0).notNull(),
  usdAmount: int("usdAmount").default(0).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de snapshots semanais (histórico imutável)
 * Criada automaticamente ao fim de cada ciclo de 7 dias
 */
export const weekSnapshots = mysqlTable("weekSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(), // YYYY-MM-DD
  weekEndDate: varchar("weekEndDate", { length: 10 }).notNull(), // YYYY-MM-DD
  // Totais por moeda em centavos
  totalGbpAmount: int("totalGbpAmount").default(0).notNull(),
  totalEurAmount: int("totalEurAmount").default(0).notNull(),
  totalUsdAmount: int("totalUsdAmount").default(0).notNull(),
  totalDurationMinutes: int("totalDurationMinutes").default(0).notNull(),
  // JSON com detalhes por dia: { day1: {...}, day2: {...}, ... }
  detailsByDay: text("detailsByDay").notNull(),
  // JSON com totais por forma de pagamento
  totalsByPaymentMethod: text("totalsByPaymentMethod").notNull(),
  backupSheetUrl: varchar("backupSheetUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Tabela de semana corrente (valores que ainda podem ser editados)
 * Zerada automaticamente após criar snapshot
 */
export const currentWeek = mysqlTable("currentWeek", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(), // YYYY-MM-DD
  currentDay: int("currentDay").default(1).notNull(), // 1-7
  isActive: int("isActive").default(0).notNull(), // 0 ou 1 (boolean)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tabela de logs de auditoria
 * Registra todas as ações críticas do sistema
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  userId: int("userId"),
  targetId: int("targetId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;

export type WeekSnapshot = typeof weekSnapshots.$inferSelect;
export type InsertWeekSnapshot = typeof weekSnapshots.$inferInsert;

export type CurrentWeek = typeof currentWeek.$inferSelect;
export type InsertCurrentWeek = typeof currentWeek.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
