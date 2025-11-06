import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { ENV } from "./_core/env";

const JWT_SECRET = process.env.JWT_SECRET || "anota_ganhos_girls_secret_key_2024";

// Middleware para autenticação
const authedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
    const user = await db.getUserById(decoded.userId);
    
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário não encontrado" });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } catch (error) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token inválido" });
  }
});

// Middleware para admin
const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado. Apenas administradores." });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    // Registro de novo usuário
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email já cadastrado" });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const userId = await db.createUser({
          email: input.email,
          passwordHash,
          name: input.name,
          role: "user",
        });

        const token = jwt.sign(
          { userId, email: input.email, role: "user" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        return { token, userId, email: input.email, name: input.name, role: "user" };
      }),

    // Login
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        return { 
          token, 
          userId: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        };
      }),

    // Obter usuário atual
    me: authedProcedure.query(({ ctx }) => ctx.user),

    // Logout
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  earnings: router({
    // Criar anotação
    create: authedProcedure
      .input(z.object({
        amount: z.number(),
        currency: z.enum(["GBP", "EUR", "USD"]),
        durationMinutes: z.number(),
        paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
        date: z.string(), // formato YYYY-MM-DD
      }))
      .mutation(async ({ ctx, input }) => {
        const amountInCents = Math.round(input.amount * 100);
        
        const earningData = {
          userId: ctx.user.id,
          gbpAmount: input.currency === "GBP" ? amountInCents : 0,
          eurAmount: input.currency === "EUR" ? amountInCents : 0,
          usdAmount: input.currency === "USD" ? amountInCents : 0,
          durationMinutes: input.durationMinutes,
          paymentMethod: input.paymentMethod,
          date: input.date,
        };

        const earningId = await db.createEarning(earningData);

        // Log de auditoria
        await db.createAuditLog({
          action: "CREATE_EARNING",
          userId: ctx.user.id,
          targetId: earningId,
          details: JSON.stringify(input),
          ipAddress: ctx.req.ip,
        });

        return { id: earningId, ...earningData };
      }),

    // Listar anotações do usuário
    list: authedProcedure.query(async ({ ctx }) => {
      return await db.getUserEarnings(ctx.user.id);
    }),

    // Editar anotação
    update: authedProcedure
      .input(z.object({
        id: z.number(),
        amount: z.number(),
        currency: z.enum(["GBP", "EUR", "USD"]),
        durationMinutes: z.number(),
        paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
        date: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const earning = await db.getEarningById(input.id);
        if (!earning) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Anotação não encontrada" });
        }

        if (earning.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para editar esta anotação" });
        }

        const amountInCents = Math.round(input.amount * 100);
        
        await db.updateEarning(input.id, {
          gbpAmount: input.currency === "GBP" ? amountInCents : 0,
          eurAmount: input.currency === "EUR" ? amountInCents : 0,
          usdAmount: input.currency === "USD" ? amountInCents : 0,
          durationMinutes: input.durationMinutes,
          paymentMethod: input.paymentMethod,
          date: input.date,
        });

        // Log de auditoria
        await db.createAuditLog({
          action: "UPDATE_EARNING",
          userId: ctx.user.id,
          targetId: input.id,
          details: JSON.stringify(input),
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    // Deletar anotação
    delete: authedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const earning = await db.getEarningById(input.id);
        if (!earning) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Anotação não encontrada" });
        }

        if (earning.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para deletar esta anotação" });
        }

        await db.deleteEarning(input.id);

        // Log de auditoria
        await db.createAuditLog({
          action: "DELETE_EARNING",
          userId: ctx.user.id,
          targetId: input.id,
          details: JSON.stringify(earning),
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),

  week: router({
    // Iniciar Top de 7 Dias
    start: authedProcedure.mutation(async ({ ctx }) => {
      const existing = await db.getCurrentWeek(ctx.user.id);
      if (existing && existing.isActive) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Já existe um Top ativo" });
      }

      const today = new Date().toISOString().split("T")[0];
      
      if (existing) {
        await db.updateCurrentWeek(ctx.user.id, {
          weekStartDate: today,
          currentDay: 1,
          isActive: 1,
        });
      } else {
        await db.createCurrentWeek({
          userId: ctx.user.id,
          weekStartDate: today,
          currentDay: 1,
          isActive: 1,
        });
      }

      // Log de auditoria
      await db.createAuditLog({
        action: "START_WEEK",
        userId: ctx.user.id,
        details: JSON.stringify({ weekStartDate: today }),
        ipAddress: ctx.req.ip,
      });

      return { success: true, weekStartDate: today };
    }),

    // Parar Top ativo
    stop: authedProcedure.mutation(async ({ ctx }) => {
      const currentWeek = await db.getCurrentWeek(ctx.user.id);
      if (!currentWeek || !currentWeek.isActive) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum Top ativo" });
      }

      await db.updateCurrentWeek(ctx.user.id, { isActive: 0 });

      // Log de auditoria
      await db.createAuditLog({
        action: "STOP_WEEK",
        userId: ctx.user.id,
        details: JSON.stringify({ weekStartDate: currentWeek.weekStartDate }),
        ipAddress: ctx.req.ip,
      });

      return { success: true };
    }),

    // Obter semana corrente
    current: authedProcedure.query(async ({ ctx }) => {
      return await db.getCurrentWeek(ctx.user.id);
    }),

    // Obter histórico de snapshots
    history: authedProcedure.query(async ({ ctx }) => {
      return await db.getUserWeekSnapshots(ctx.user.id);
    }),

    // Obter estatísticas da semana corrente
    stats: authedProcedure.query(async ({ ctx }) => {
      const currentWeekData = await db.getCurrentWeek(ctx.user.id);
      if (!currentWeekData || !currentWeekData.isActive) {
        return null;
      }

      const startDate = currentWeekData.weekStartDate;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 6);
      const endDateStr = endDate.toISOString().split("T")[0];

      const weekEarnings = await db.getUserEarnings(ctx.user.id);
      const filtered = weekEarnings.filter(
        (e) => e.date >= startDate && e.date <= endDateStr
      );

      let totalGbp = 0;
      let totalEur = 0;
      let totalUsd = 0;
      let totalDuration = 0;
      const byPaymentMethod: Record<string, { gbp: number; eur: number; usd: number }> = {};

      for (const earning of filtered) {
        totalGbp += earning.gbpAmount;
        totalEur += earning.eurAmount;
        totalUsd += earning.usdAmount;
        totalDuration += earning.durationMinutes;

        if (!byPaymentMethod[earning.paymentMethod]) {
          byPaymentMethod[earning.paymentMethod] = { gbp: 0, eur: 0, usd: 0 };
        }
        byPaymentMethod[earning.paymentMethod].gbp += earning.gbpAmount;
        byPaymentMethod[earning.paymentMethod].eur += earning.eurAmount;
        byPaymentMethod[earning.paymentMethod].usd += earning.usdAmount;
      }

      return {
        weekStartDate: startDate,
        currentDay: currentWeekData.currentDay,
        totalGbp,
        totalEur,
        totalUsd,
        totalDuration,
        byPaymentMethod,
        earningsCount: filtered.length,
      };
    }),
  }),

  admin: router({
    // Listar todos os usuários
    users: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    // Listar anotações de qualquer usuário
    earnings: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserEarnings(input.userId);
      }),

    // Editar anotação de qualquer usuário
    updateEarning: adminProcedure
      .input(z.object({
        id: z.number(),
        amount: z.number(),
        currency: z.enum(["GBP", "EUR", "USD"]),
        durationMinutes: z.number(),
        paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
        date: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const amountInCents = Math.round(input.amount * 100);
        
        await db.updateEarning(input.id, {
          gbpAmount: input.currency === "GBP" ? amountInCents : 0,
          eurAmount: input.currency === "EUR" ? amountInCents : 0,
          usdAmount: input.currency === "USD" ? amountInCents : 0,
          durationMinutes: input.durationMinutes,
          paymentMethod: input.paymentMethod,
          date: input.date,
        });

        // Log de auditoria
        await db.createAuditLog({
          action: "ADMIN_UPDATE_EARNING",
          userId: ctx.user.id,
          targetId: input.id,
          details: JSON.stringify(input),
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    // Deletar anotação de qualquer usuário
    deleteEarning: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const earning = await db.getEarningById(input.id);
        
        await db.deleteEarning(input.id);

        // Log de auditoria
        await db.createAuditLog({
          action: "ADMIN_DELETE_EARNING",
          userId: ctx.user.id,
          targetId: input.id,
          details: JSON.stringify(earning),
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),

    // Obter logs de auditoria
    auditLogs: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getAuditLogs(input.limit || 100);
      }),

    // Obter todos os snapshots
    allSnapshots: adminProcedure.query(async () => {
      return await db.getAllWeekSnapshots();
    }),

    // Criar snapshot manual
    createSnapshot: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const currentWeekData = await db.getCurrentWeek(input.userId);
        if (!currentWeekData) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Nenhuma semana ativa encontrada" });
        }

        // Importar função do job
        // @ts-ignore
        const { createWeekSnapshot } = await import("./weeklySnapshotJob.mjs");
        await createWeekSnapshot(input.userId, currentWeekData.weekStartDate);

        // Log de auditoria
        await db.createAuditLog({
          action: "ADMIN_CREATE_SNAPSHOT",
          userId: ctx.user.id,
          targetId: input.userId,
          details: JSON.stringify({ weekStartDate: currentWeekData.weekStartDate }),
          ipAddress: ctx.req.ip,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
