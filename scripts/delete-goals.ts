import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../.env.local") });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../lib/db/schema";
import { userGoals } from "../lib/db/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client, { schema });

async function deleteGoals() {
  await db.delete(userGoals);
  console.log("Goals deleted successfully - refresh dashboard to see onboarding wizard");
  process.exit(0);
}

deleteGoals().catch(console.error);

