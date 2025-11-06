import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-in-production";

// Procedure protegido que requer autenticação
const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const user = await db.getUserByEmail(payload.email);
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
    }
    return next({ ctx: { ...ctx, user } });
  } catch (error) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }
});

// Procedure admin que requer role admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email já cadastrado" });
        }
        
        await db.createUser(input.email, input.password, input.name);
        const user = await db.getUserByEmail(input.email);
        
        const token = jwt.sign(
          { userId: user!.id, email: user!.email },
          JWT_SECRET,
          { expiresIn: "30d" }
        );
        
        return { token, user: { id: user!.id, email: user!.email, name: user!.name } };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email ou senha incorretos" });
        }
        
        const valid = await db.verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email ou senha incorretos" });
        }
        
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "30d" }
        );
        
        return { token, user: { id: user.id, email: user.email, name: user.name } };
      }),

    me: protectedProcedure.query(({ ctx }) => ctx.user),
  }),

  earnings: router({
    create: protectedProcedure
      .input(z.object({
        amount: z.number().positive(),
        currency: z.enum(["GBP", "EUR", "USD"]),
        duration: z.number().positive(),
        paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
        date: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createEarning({
          userId: ctx.user.id,
          amount: Math.round(input.amount * 100),
          currency: input.currency,
          duration: input.duration,
          paymentMethod: input.paymentMethod,
          date: input.date,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const earnings = await db.getUserEarnings(ctx.user.id);
      return earnings.map(e => ({
        ...e,
        amount: e.amount / 100,
      }));
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteEarning(input.id, ctx.user.id);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        amount: z.number(),
        currency: z.enum(["GBP", "EUR", "USD"]),
        duration: z.number(),
        paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
        date: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateEarning(input.id, ctx.user.id, {
          amount: Math.round(input.amount * 100),
          currency: input.currency,
          duration: input.duration,
          paymentMethod: input.paymentMethod,
          date: input.date,
        });
        return { success: true };
      }),
  }),

  tops: router({
    // Obter top ativo do usuário
    getActive: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getActiveTop(ctx.user.id);
      }),

    // Iniciar novo top
    start: protectedProcedure
      .mutation(async ({ ctx }) => {
        const activeTop = await db.getActiveTop(ctx.user.id);
        if (activeTop) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Já existe um Top ativo" });
        }
        return await db.createTop(ctx.user.id);
      }),

    // Encerrar top manualmente
    complete: protectedProcedure
      .mutation(async ({ ctx }) => {
        const activeTop = await db.getActiveTop(ctx.user.id);
        if (!activeTop) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum Top ativo" });
        }
        // Encerrar o top
        await db.completeTop(activeTop.id);
        // Retornar ID do top para redirecionar ao relatório
        return { topId: activeTop.id };
      }),

    // Listar histórico de tops
    history: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getTopHistory(ctx.user.id);
      }),

    // Obter detalhes de um top específico
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const top = await db.getTopById(input.id);
        if (!top || top.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Top não encontrado" });
        }
        return top;
      }),

    // Obter ganhos de um top específico
    getEarnings: protectedProcedure
      .input(z.object({ topId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await db.getTopEarnings(input.topId, ctx.user.id);
      }),
  }),

  admin: router({
    // Listar todas as usuárias
    listUsers: adminProcedure
      .query(async () => {
        return await db.getAllUsers();
      }),

    // Listar todos os ganhos de todas as usuárias
    listAllEarnings: adminProcedure
      .query(async () => {
        return await db.getAllEarnings();
      }),

    // Editar ganho de qualquer usuária
    updateEarning: adminProcedure
      .input(z.object({
        id: z.number(),
        amount: z.number(),
        currency: z.enum(["GBP", "EUR", "USD"]),
        duration: z.number(),
        paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
        date: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateEarningAdmin(input.id, {
          amount: Math.round(input.amount * 100),
          currency: input.currency,
          duration: input.duration,
          paymentMethod: input.paymentMethod,
          date: input.date,
        });
        return { success: true };
      }),

    // Deletar ganho de qualquer usuária
    deleteEarning: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEarningAdmin(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
