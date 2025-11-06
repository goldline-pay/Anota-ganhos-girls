import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { tops, earnings } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function checkExpiredTops() {
  const now = new Date();
  
  // Buscar tops ativos
  const activeTops = await db.select().from(tops).where(eq(tops.status, "active"));
  
  for (const top of activeTops) {
    const daysSinceStart = Math.floor((now - new Date(top.startDate)) / (1000 * 60 * 60 * 24));
    
    // Se passou 7 dias, encerrar automaticamente
    if (daysSinceStart >= 7) {
      await db.update(tops)
        .set({ 
          status: "completed",
          endDate: now
        })
        .where(eq(tops.id, top.id));
      
      console.log(`Top ${top.id} encerrado automaticamente após 7 dias`);
    }
  }
}

// Executar a cada hora
setInterval(checkExpiredTops, 60 * 60 * 1000);

// Executar imediatamente ao iniciar
checkExpiredTops();
