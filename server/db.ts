import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, earnings, InsertUser, InsertEarning } from "../drizzle/schema";
import bcrypt from "bcryptjs";

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function createUser(email: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.insert(users).values({
    email,
    passwordHash,
    name,
  });
  
  return { success: true };
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

// ============ EARNINGS FUNCTIONS ============

export async function createEarning(earning: InsertEarning) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(earnings).values(earning);
  return { success: true };
}

export async function getUserEarnings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(earnings).where(eq(earnings.userId, userId));
}

export async function deleteEarning(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(earnings).where(eq(earnings.id, id));
}
