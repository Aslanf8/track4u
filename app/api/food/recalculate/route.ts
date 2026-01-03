import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recalculateFromIngredients } from "@/lib/openai";
import { recalculateFromIngredientsGemini } from "@/lib/gemini";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { IngredientSchema } from "@/lib/types/ingredients";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ingredients, context } = body;

    // Validate ingredients array
    const IngredientsArraySchema = z.array(IngredientSchema);
    const validatedIngredients = IngredientsArraySchema.parse(ingredients);

    // Check user's preferred provider
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { preferredProvider: true, preferredGeminiModel: true },
    });

    const provider = user?.preferredProvider || "openai";
    let result;

    // Route to correct provider
    if (provider === "google") {
      const modelId = user?.preferredGeminiModel || "gemini-2.5-flash";
      result = await recalculateFromIngredientsGemini(
        validatedIngredients,
        session.user.id,
        context,
        modelId
      );
    } else {
      result = await recalculateFromIngredients(
        validatedIngredients,
        session.user.id,
        context
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recalculation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid ingredients data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle missing API key specifically
    if (error instanceof Error && error.message === "NO_API_KEY") {
      return NextResponse.json(
        {
          error:
            "Missing API Key. Please check your Settings to ensure you have added a key for your selected provider.",
          code: "NO_API_KEY",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to recalculate",
      },
      { status: 500 }
    );
  }
}

