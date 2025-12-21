import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeFoodImage, categorizeOpenAIError, NoApiKeyError } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // User's API key is REQUIRED - no fallback
    const result = await analyzeFoodImage(image, session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Food analysis error:", error);
    
    // Handle missing API key specifically
    if (error instanceof NoApiKeyError) {
      return NextResponse.json(
        { 
          error: "Please add your OpenAI API key in Settings to use AI features.",
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
