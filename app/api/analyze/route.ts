import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeFoodImage, categorizeOpenAIError, NoApiKeyError } from "@/lib/openai";
import { analyzeFoodImageGemini, getUserGeminiModel } from "@/lib/gemini";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image, context } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

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
      result = await analyzeFoodImageGemini(image, session.user.id, context, modelId);
    } else {
      result = await analyzeFoodImage(image, session.user.id, context);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Food analysis error:", error);
    
    // Handle missing API key specifically
    if (error instanceof NoApiKeyError) {
      return NextResponse.json(
        { 
          error: "Missing API Key. Please check your Settings to ensure you have added a key for your selected provider.",
          code: "NO_API_KEY",
        },
        { status: 403 }
      );
    }
    
    const categorized = categorizeOpenAIError(error);
    
    return NextResponse.json(
      { 
        error: categorized.message,
        code: categorized.code,
      },
      { status: categorized.status || 500 }
    );
  }
}
