import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, gte, lte } from "drizzle-orm";
import { users, earnings, weekSnapshots, currentWeek, auditLogs } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

/**
 * Job que roda diariamente para verificar se alguma semana deve ser finalizada
 * e criar snapshot automático
 */
async function runWeeklySnapshotJob() {
  console.log("[WeeklySnapshotJob] Iniciando verificação de semanas...");
  
  try {
    // Buscar todas as semanas ativas
    const activeWeeks = await db
      .select()
      .from(currentWeek)
      .where(eq(currentWeek.isActive, 1));

    console.log(`[WeeklySnapshotJob] Encontradas ${activeWeeks.length} semanas ativas`);

    for (const week of activeWeeks) {
      const startDate = new Date(week.weekStartDate);
      const today = new Date();
      
      // Calcular diferença em dias
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log(`[WeeklySnapshotJob] Usuário ${week.userId}: semana iniciada em ${week.weekStartDate}, ${diffDays} dias atrás`);

      // Se completou 7 dias, criar snapshot
      if (diffDays >= 7) {
        console.log(`[WeeklySnapshotJob] Criando snapshot para usuário ${week.userId}...`);
        await createWeekSnapshot(week.userId, week.weekStartDate);
      }
    }

    console.log("[WeeklySnapshotJob] Verificação concluída com sucesso");
  } catch (error) {
    console.error("[WeeklySnapshotJob] Erro:", error);
    throw error;
  }
}

/**
 * Cria um snapshot da semana e zera os valores correntes
 */
async function createWeekSnapshot(userId, weekStartDate) {
  try {
    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // 7 dias depois

    const weekStartStr = weekStartDate;
    const weekEndStr = endDate.toISOString().split("T")[0];

    // Buscar todas as anotações da semana
    const weekEarnings = await db
      .select()
      .from(earnings)
      .where(
        and(
          eq(earnings.userId, userId),
          gte(earnings.date, weekStartStr),
          lte(earnings.date, weekEndStr)
        )
      );

    console.log(`[WeeklySnapshotJob] Encontradas ${weekEarnings.length} anotações para o período`);

    // Calcular totais
    let totalGbp = 0;
    let totalEur = 0;
    let totalUsd = 0;
    let totalDuration = 0;

    const detailsByDay = {};
    const totalsByPaymentMethod = {};

    for (const earning of weekEarnings) {
      totalGbp += earning.gbpAmount;
      totalEur += earning.eurAmount;
      totalUsd += earning.usdAmount;
      totalDuration += earning.durationMinutes;

      // Agrupar por dia
      if (!detailsByDay[earning.date]) {
        detailsByDay[earning.date] = {
          earnings: [],
          totalGbp: 0,
          totalEur: 0,
          totalUsd: 0,
        };
      }

      detailsByDay[earning.date].earnings.push({
        id: earning.id,
        gbpAmount: earning.gbpAmount,
        eurAmount: earning.eurAmount,
        usdAmount: earning.usdAmount,
        durationMinutes: earning.durationMinutes,
        paymentMethod: earning.paymentMethod,
      });

      detailsByDay[earning.date].totalGbp += earning.gbpAmount;
      detailsByDay[earning.date].totalEur += earning.eurAmount;
      detailsByDay[earning.date].totalUsd += earning.usdAmount;

      // Agrupar por forma de pagamento
      if (!totalsByPaymentMethod[earning.paymentMethod]) {
        totalsByPaymentMethod[earning.paymentMethod] = {
          gbpAmount: 0,
          eurAmount: 0,
          usdAmount: 0,
        };
      }

      totalsByPaymentMethod[earning.paymentMethod].gbpAmount += earning.gbpAmount;
      totalsByPaymentMethod[earning.paymentMethod].eurAmount += earning.eurAmount;
      totalsByPaymentMethod[earning.paymentMethod].usdAmount += earning.usdAmount;
    }

    // Criar snapshot
    await db.insert(weekSnapshots).values({
      userId,
      weekStartDate: weekStartStr,
      weekEndDate: weekEndStr,
      totalGbpAmount: totalGbp,
      totalEurAmount: totalEur,
      totalUsdAmount: totalUsd,
      totalDurationMinutes: totalDuration,
      detailsByDay: JSON.stringify(detailsByDay),
      totalsByPaymentMethod: JSON.stringify(totalsByPaymentMethod),
      backupSheetUrl: null, // Será preenchido pelo job de backup
    });

    console.log(`[WeeklySnapshotJob] Snapshot criado: GBP ${totalGbp/100}, EUR ${totalEur/100}, USD ${totalUsd/100}`);

    // Zerar semana corrente (desativar)
    await db
      .update(currentWeek)
      .set({ isActive: 0 })
      .where(eq(currentWeek.userId, userId));

    // Log de auditoria
    await db.insert(auditLogs).values({
      action: "WEEKLY_SNAPSHOT_CREATED",
      userId,
      details: JSON.stringify({
        weekStartDate: weekStartStr,
        weekEndDate: weekEndStr,
        totalGbp: totalGbp / 100,
        totalEur: totalEur / 100,
        totalUsd: totalUsd / 100,
        earningsCount: weekEarnings.length,
      }),
      ipAddress: "SYSTEM_JOB",
    });

    console.log(`[WeeklySnapshotJob] Semana finalizada para usuário ${userId}`);
  } catch (error) {
    console.error(`[WeeklySnapshotJob] Erro ao criar snapshot para usuário ${userId}:`, error);
    
    // Log de erro
    await db.insert(auditLogs).values({
      action: "WEEKLY_SNAPSHOT_ERROR",
      userId,
      details: JSON.stringify({ error: error.message }),
      ipAddress: "SYSTEM_JOB",
    });
    
    throw error;
  }
}

// Executar job
if (import.meta.url === `file://${process.argv[1]}`) {
  runWeeklySnapshotJob()
    .then(() => {
      console.log("[WeeklySnapshotJob] Job concluído");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[WeeklySnapshotJob] Job falhou:", error);
      process.exit(1);
    });
}

export { runWeeklySnapshotJob, createWeekSnapshot };
