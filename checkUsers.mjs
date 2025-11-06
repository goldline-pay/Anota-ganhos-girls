import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function checkUsers() {
  const result = await db.select().from(users);
  console.log("Usuários no banco:");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

checkUsers().catch(console.error);
