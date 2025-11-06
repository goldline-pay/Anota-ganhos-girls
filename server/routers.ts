import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  earnings: router({
    create: protectedProcedure
      .input(
        z.object({
          amount: z.number().positive(),
          currency: z.enum(["GBP", "EUR", "USD"]),
          duration: z.number().positive(),
          paymentMethod: z.enum(["Cash", "Revolut", "PayPal", "Wise", "AIB", "Crypto"]),
          date: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createEarning({
          userId: ctx.user.id,
          amount: Math.round(input.amount * 100), // converter para centavos
          currency: input.currency,
          duration: input.duration,
          paymentMethod: input.paymentMethod,
          date: input.date,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const earnings = await db.getUserEarnings(ctx.user.id);
      // Converter centavos de volta para reais
      return earnings.map(e => ({
        ...e,
        amount: e.amount / 100,
      }));
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteEarning(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
