import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, earnings, weekSnapshots, currentWeek, auditLogs, InsertUser, InsertEarning, InsertWeekSnapshot, InsertCurrentWeek, InsertAuditLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(users).values(user);
  return result.insertId;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users);
}

// ============ EARNINGS FUNCTIONS ============

export async function createEarning(earning: InsertEarning) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(earnings).values(earning);
  return result.insertId;
}

export async function getUserEarnings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(earnings).where(eq(earnings.userId, userId));
}

export async function getEarningById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(earnings).where(eq(earnings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEarning(id: number, data: Partial<InsertEarning>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(earnings).set(data).where(eq(earnings.id, id));
}

export async function deleteEarning(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(earnings).where(eq(earnings.id, id));
}

// ============ WEEK SNAPSHOT FUNCTIONS ============

export async function createWeekSnapshot(snapshot: InsertWeekSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(weekSnapshots).values(snapshot);
  return result.insertId;
}

export async function getUserWeekSnapshots(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(weekSnapshots).where(eq(weekSnapshots.userId, userId));
}

export async function getAllWeekSnapshots() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(weekSnapshots);
}

// ============ CURRENT WEEK FUNCTIONS ============

export async function getCurrentWeek(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(currentWeek).where(eq(currentWeek.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCurrentWeek(week: InsertCurrentWeek) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(currentWeek).values(week);
  return result.insertId;
}

export async function updateCurrentWeek(userId: number, data: Partial<InsertCurrentWeek>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(currentWeek).set(data).where(eq(currentWeek.userId, userId));
}

export async function deleteCurrentWeek(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(currentWeek).where(eq(currentWeek.userId, userId));
}

// ============ AUDIT LOG FUNCTIONS ============

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(auditLogs).values(log);
  return result.insertId;
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(auditLogs).limit(limit);
}

// ============ COMPATIBILITY FUNCTIONS (for SDK) ============
// These functions are needed for compatibility with Manus OAuth SDK
// but are not used in this project since we use email/password auth

export async function getUserByOpenId(openId: string) {
  // Not used in this project
  return undefined;
}

export async function upsertUser(user: any) {
  // Not used in this project
  return;
}
