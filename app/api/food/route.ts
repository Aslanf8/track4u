import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foodEntries } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const query = db.query.foodEntries.findMany({
      where: and(
        eq(foodEntries.userId, session.user.id),
        startDate ? gte(foodEntries.consumedAt, new Date(startDate)) : undefined,
        endDate ? lte(foodEntries.consumedAt, new Date(endDate)) : undefined
      ),
      orderBy: [desc(foodEntries.consumedAt)],
    });

    const entries = await query;

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching food entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch food entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const entry = await db
      .insert(foodEntries)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: body.name,
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        fiber: body.fiber || 0,
        description: body.description,
        imageUrl: body.imageUrl,
        consumedAt: body.consumedAt ? new Date(body.consumedAt) : new Date(),
      })
      .returning();

    return NextResponse.json(entry[0], { status: 201 });
  } catch (error) {
    console.error("Error creating food entry:", error);
    return NextResponse.json(
      { error: "Failed to create food entry" },
      { status: 500 }
    );
  }
}

