import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GEMINI_MODELS } from "@/lib/gemini-models";

// GET: Return current Gemini model preference and available models list
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { preferredGeminiModel: true },
    });

    return NextResponse.json({
      model: user?.preferredGeminiModel || "gemini-2.5-flash",
      availableModels: GEMINI_MODELS,
    });
  } catch (error) {
    console.error("Error fetching Gemini model preference:", error);
    return NextResponse.json(
      { error: "Failed to fetch model preference" },
      { status: 500 }
    );
  }
}

// PUT: Update user's preferredGeminiModel preference
export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { model } = await request.json();

    // Validate model ID
    const validModelIds = GEMINI_MODELS.map((m) => m.id);
    if (!validModelIds.includes(model)) {
      return NextResponse.json(
        { error: "Invalid model ID" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        preferredGeminiModel: model,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      model,
    });
  } catch (error) {
    console.error("Error updating Gemini model preference:", error);
    return NextResponse.json(
      { error: "Failed to update model preference" },
      { status: 500 }
    );
  }
}

