import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users, userGoals } from "../lib/db/schema";
import { hash } from "bcryptjs";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database...");

  // Create user account
  const passwordHash = await hash("password", 12);
  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    email: "aslan.farboud",
    passwordHash,
    name: "Aslan",
  });

  // Create default goals for the user
  await db.insert(userGoals).values({
    id: crypto.randomUUID(),
    userId,
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFat: 65,
  });

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("User created:");
  console.log("  Email: aslan.farboud");
  console.log("  Password: password");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
