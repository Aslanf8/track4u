import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userGoals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const goals = await db.query.userGoals.findFirst({
      where: eq(userGoals.userId, session.user.id),
    });

    if (!goals) {
      // Return null to indicate no goals set - triggers onboarding
      return NextResponse.json(null);
    }

    // Round weight to 1 decimal place for consistency
    const roundedGoals = {
      ...goals,
      weight: goals.weight ? Math.round(goals.weight * 10) / 10 : goals.weight,
    };

    return NextResponse.json(roundedGoals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

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

    if (existingGoals) {
      // Update existing goals
      // Round weight to 1 decimal place
      const updated = await db
        .update(userGoals)
        .set({
          age: body.age,
          sex: body.sex,
          weight: body.weight ? Math.round(body.weight * 10) / 10 : body.weight,
          height: body.height,
          activityLevel: body.activityLevel,
          goalType: body.goalType,
          dailyCalories: body.dailyCalories,
          dailyProtein: body.dailyProtein,
          dailyCarbs: body.dailyCarbs,
          dailyFat: body.dailyFat,
        })
        .where(eq(userGoals.userId, session.user.id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new goals
      // Round weight to 1 decimal place
      const created = await db
        .insert(userGoals)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          age: body.age,
          sex: body.sex,
          weight: body.weight ? Math.round(body.weight * 10) / 10 : body.weight,
          height: body.height,
          activityLevel: body.activityLevel,
          goalType: body.goalType,
          dailyCalories: body.dailyCalories,
          dailyProtein: body.dailyProtein,
          dailyCarbs: body.dailyCarbs,
          dailyFat: body.dailyFat,
        })
        .returning();

      return NextResponse.json(created[0], { status: 201 });
    }
  } catch (error) {
    console.error("Error updating goals:", error);
    return NextResponse.json(
      { error: "Failed to update goals" },
      { status: 500 }
    );
  }
}
