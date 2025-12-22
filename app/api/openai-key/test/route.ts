import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

// POST: Test an API key without saving it
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Test the key by listing models - no format validation
    try {
      const testClient = new OpenAI({ apiKey });
      const models = await testClient.models.list();
      
      // Check if GPT-5 models are available (indicates a paid account with latest access)
      const hasGpt5 = models.data.some(m => m.id.includes("gpt-5"));
      const hasGpt4 = models.data.some(m => m.id.includes("gpt-4"));
      
      return NextResponse.json({
        valid: true,
        hasGpt5Access: hasGpt5,
        hasGpt4Access: hasGpt4, // Keep for backward compatibility
        modelsAvailable: models.data.length,
      });
    } catch (openaiError: unknown) {
      const error = openaiError as { status?: number; message?: string; code?: string };
      
      if (error.status === 401) {
        return NextResponse.json({
          valid: false,
          error: "Invalid API key. Please check your key and try again.",
        });
      }
      
      if (error.status === 429) {
        return NextResponse.json({
          valid: false,
          error: "Rate limit or quota exceeded on this API key.",
        });
      }
      
      if (error.code === "insufficient_quota") {
        return NextResponse.json({
          valid: false,
          error: "This API key has exceeded its quota. Please add credits to your OpenAI account.",
        });
      }

      return NextResponse.json({
        valid: false,
        error: error.message || "Failed to validate API key",
      });
    }
  } catch (error) {
    console.error("Error testing API key:", error);
    return NextResponse.json(
      { error: "Failed to test API key" },
      { status: 500 }
    );
  }
}

