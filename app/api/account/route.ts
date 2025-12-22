import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userGoals, foodEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Delete in order due to foreign key constraints
    // 1. Delete all food entries
    await db.delete(foodEntries).where(eq(foodEntries.userId, userId));
    
    // 2. Delete user goals
    await db.delete(userGoals).where(eq(userGoals.userId, userId));
    
    // 3. Delete the user
    await db.delete(users).where(eq(users.id, userId));

    console.log(`Account deleted for user: ${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

