import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, earnings, tops, InsertUser, InsertEarning, InsertTop } from "../drizzle/schema";
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

export async function createUser(email: string, nickname: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  await db.insert(users).values({
    email,
    nickname,
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

export async function getUserByNickname(nickname: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.nickname, nickname)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmailOrNickname(emailOrNickname: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users)
    .where(sql`${users.email} = ${emailOrNickname} OR ${users.nickname} = ${emailOrNickname}`)
    .limit(1);
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

export async function deleteEarning(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(earnings).where(eq(earnings.id, id));
}

// ============ TOPS FUNCTIONS ============

export async function createTop(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const startDate = new Date();
  
  const result = await db.insert(tops).values({
    userId,
    startDate,
    status: "active",
  });
  
  return { success: true, id: result[0].insertId };
}

export async function getActiveTop(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tops)
    .where(eq(tops.userId, userId))
    .limit(1);
  
  return result.find(t => t.status === "active") || null;
}

export async function completeTop(topId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tops)
    .set({ status: "completed", endDate: new Date() })
    .where(eq(tops.id, topId));
  
  return { success: true };
}

export async function getTopHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tops)
    .where(eq(tops.userId, userId));
}

export async function getTopById(topId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tops).where(eq(tops.id, topId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTopEarnings(topId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const top = await getTopById(topId);
  if (!top || top.userId !== userId) return [];
  
  return await db.select().from(earnings)
    .where(eq(earnings.userId, userId));
}

export async function updateEarning(id: number, userId: number, data: Partial<InsertEarning>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(earnings)
    .set(data)
    .where(eq(earnings.id, id));
  
  return { success: true };
}

// ============ ADMIN FUNCTIONS ============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users);
}

export async function getAllEarnings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(earnings);
}

export async function updateEarningAdmin(id: number, data: Partial<InsertEarning>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(earnings)
    .set(data)
    .where(eq(earnings.id, id));
  
  return { success: true };
}

export async function deleteEarningAdmin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(earnings).where(eq(earnings.id, id));
  return { success: true };
}

// ============ WEEKLY HISTORY FUNCTIONS ============

export async function getAvailableWeeks(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Agregar semanas únicas dos ganhos
  const query = userId
    ? db.select({ weekStart: sql<string>`DISTINCT ${earnings.date}` }).from(earnings).where(eq(earnings.userId, userId)).orderBy(sql`${earnings.date} DESC`)
    : db.select({ weekStart: sql<string>`DISTINCT ${earnings.date}` }).from(earnings).orderBy(sql`${earnings.date} DESC`);
  
  const result = await query;
  return result || [];
}

export async function getWeeklyRanking(weekStart: string, userId?: number, search?: string, orderBy: string = "gross") {
  const db = await getDb();
  if (!db) return { rankings: [], totals: { gross: 0, net: 0 } };
  
  // Calcular início e fim da semana
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const startStr = weekStart;
  const endStr = endDate.toISOString().split('T')[0];
  
  // Agregar ganhos por usuária na semana
  let query = sql`
    SELECT 
      u.id as userId,
      u.name,
      u.nickname,
      SUM(e.amount) as totalGross,
      0 as totalNet,
      COUNT(DISTINCT e.date) as daysWorked
    FROM users u
    LEFT JOIN earnings e ON u.id = e.userId AND e.date >= ${startStr} AND e.date < ${endStr}
  `;
  
  if (userId) {
    query = sql`${query} WHERE u.id = ${userId}`;
  }
  
  if (search) {
    const searchPattern = `%${search}%`;
    query = userId 
      ? sql`${query} AND (u.name LIKE ${searchPattern} OR u.nickname LIKE ${searchPattern})`
      : sql`${query} WHERE (u.name LIKE ${searchPattern} OR u.nickname LIKE ${searchPattern})`;
  }
  
  query = sql`${query} GROUP BY u.id, u.name, u.nickname HAVING totalGross > 0`;
  
  // Ordenação
  if (orderBy === "gross") {
    query = sql`${query} ORDER BY totalGross DESC`;
  } else if (orderBy === "days") {
    query = sql`${query} ORDER BY daysWorked DESC`;
  } else if (orderBy === "name") {
    query = sql`${query} ORDER BY u.name ASC`;
  }
  
  const result: any = await db.execute(query);
  const rankings = result[0] || [];
  
  // Calcular totais
  const totals = rankings.reduce((acc: any, r: any) => ({
    gross: acc.gross + (r.totalGross || 0),
    net: acc.net + (r.totalNet || 0),
  }), { gross: 0, net: 0 });
  
  return { rankings, totals, weekStart: startStr, weekEnd: endStr };
}

export async function getWeeklyUserDetail(weekStart: string, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  
  const startStr = weekStart;
  const endStr = endDate.toISOString().split('T')[0];
  
  // Buscar todos os ganhos da usuária na semana
  const earningsResult = await db
    .select()
    .from(earnings)
    .where(and(
      eq(earnings.userId, userId),
      sql`${earnings.date} >= ${startStr}`,
      sql`${earnings.date} < ${endStr}`
    ))
    .orderBy(earnings.date);
  
  // Buscar dados da usuária
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userResult[0];
  
  if (!user) return null;
  
  // Agregar por dia e por moeda
  const byDay: any = {};
  let totalGross = 0;
  let totalGbp = 0;
  let totalEur = 0;
  let totalUsd = 0;
  
  earningsResult.forEach((e: any) => {
    if (!byDay[e.date]) {
      byDay[e.date] = { date: e.date, earnings: [], total: 0 };
    }
    byDay[e.date].earnings.push(e);
    byDay[e.date].total += e.amount;
    totalGross += e.amount;
    
    // Agregar por moeda
    if (e.currency === 'GBP') totalGbp += e.amount;
    else if (e.currency === 'EUR') totalEur += e.amount;
    else if (e.currency === 'USD') totalUsd += e.amount;
  });
  
  const days = Object.values(byDay);
  
  return {
    user: { id: user.id, name: user.name, nickname: user.nickname },
    userName: user.nickname || user.name,
    weekStart: startStr,
    weekEnd: endStr,
    totalGross,
    daysWorked: days.length,
    days,
    earnings: earningsResult,
    totals: {
      gbp: totalGbp,
      eur: totalEur,
      usd: totalUsd,
    },
  };
}
