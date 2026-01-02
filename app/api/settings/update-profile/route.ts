import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userGoals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PUT: Update body stats (weight, height, age, sex, activityLevel) without running full wizard
export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if goals exist
    const existingGoals = await db.query.userGoals.findFirst({
      where: eq(userGoals.userId, session.user.id),
    });

    const updateData: Partial<typeof userGoals.$inferInsert> = {};

    // Allow partial updates - only update fields that are provided
    // Round weight to 1 decimal place
    if (body.weight !== undefined) {
      updateData.weight = Math.round(body.weight * 10) / 10;
    }
    if (body.height !== undefined) updateData.height = body.height;
    if (body.age !== undefined) updateData.age = body.age;
    if (body.sex !== undefined) updateData.sex = body.sex;
    if (body.activityLevel !== undefined) updateData.activityLevel = body.activityLevel;

    if (existingGoals) {
      // Update existing goals
      const updated = await db
        .update(userGoals)
        .set(updateData)
        .where(eq(userGoals.userId, session.user.id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new goals if they don't exist
      const created = await db
        .insert(userGoals)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          weight: body.weight ? Math.round(body.weight * 10) / 10 : undefined,
          height: body.height,
          age: body.age,
          sex: body.sex,
          activityLevel: body.activityLevel,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyCarbs: 200,
          dailyFat: 65,
        })
        .returning();

      return NextResponse.json(created[0], { status: 201 });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

