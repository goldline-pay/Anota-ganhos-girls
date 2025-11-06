import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function createAdminUser() {
  const adminEmail = "admin@anotaganhos.com";
  const adminPassword = "Admin123!";
  
  // Verificar se já existe
  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  
  if (existing.length > 0) {
    console.log("✓ Usuário admin já existe");
    return;
  }
  
  // Criar admin
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.insert(users).values({
    email: adminEmail,
    passwordHash,
    name: "Admin",
    role: "admin",
  });
  
  console.log("✓ Usuário admin criado com sucesso!");
  console.log("  Email: admin@anotaganhos.com");
  console.log("  Senha: Admin123!");
  process.exit(0);
}

createAdminUser().catch(console.error);
