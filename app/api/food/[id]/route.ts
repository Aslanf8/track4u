import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { foodEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const entry = await db.query.foodEntries.findFirst({
      where: and(
        eq(foodEntries.id, id),
        eq(foodEntries.userId, session.user.id)
      ),
    });

    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching food entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch food entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const updateData: {
      name?: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      description?: string;
      imageUrl?: string | null;
      ingredientBreakdown?: string | null;
      consumedAt?: Date;
    } = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.calories !== undefined) updateData.calories = body.calories;
    if (body.protein !== undefined) updateData.protein = body.protein;
    if (body.carbs !== undefined) updateData.carbs = body.carbs;
    if (body.fat !== undefined) updateData.fat = body.fat;
    if (body.fiber !== undefined) updateData.fiber = body.fiber;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.ingredientBreakdown !== undefined) {
      updateData.ingredientBreakdown = body.ingredientBreakdown
        ? JSON.stringify(body.ingredientBreakdown)
        : null;
    }
    if (body.consumedAt !== undefined)
      updateData.consumedAt = body.consumedAt ? new Date(body.consumedAt) : undefined;

    const updated = await db
      .update(foodEntries)
      .set(updateData)
      .where(
        and(eq(foodEntries.id, id), eq(foodEntries.userId, session.user.id))
      )
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating food entry:", error);
    return NextResponse.json(
      { error: "Failed to update food entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await db
      .delete(foodEntries)
      .where(
        and(eq(foodEntries.id, id), eq(foodEntries.userId, session.user.id))
      )
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food entry:", error);
    return NextResponse.json(
      { error: "Failed to delete food entry" },
      { status: 500 }
    );
  }
}

