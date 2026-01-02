import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// POST: Test a Google API key without saving it
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

    // Test the key by attempting to list models or make a simple API call
    try {
      const testClient = new GoogleGenerativeAI(apiKey.trim());
      const model = testClient.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Make a simple test call
      const result = await model.generateContent("test");
      await result.response;

      return NextResponse.json({
        valid: true,
        message: "Google API key is valid!",
      });
    } catch (geminiError: unknown) {
      const error = geminiError as { status?: number; message?: string; code?: string };
      
      if (error.status === 401 || error.message?.includes("API_KEY_INVALID")) {
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

      if (error.message?.includes("quota") || error.message?.includes("QUOTA")) {
        return NextResponse.json({
          valid: false,
          error: "This API key has exceeded its quota. Please check your Google Cloud billing.",
        });
      }

      return NextResponse.json({
        valid: false,
        error: error.message || "Failed to validate API key",
      });
    }
  } catch (error) {
    console.error("Error testing Google API key:", error);
    return NextResponse.json(
      { error: "Failed to test API key" },
      { status: 500 }
    );
  }
}

