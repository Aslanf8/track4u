import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeFoodImage, categorizeOpenAIError, NoApiKeyError } from "@/lib/openai";
import { analyzeFoodImageGemini } from "@/lib/gemini";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image, images, context } = await request.json();

    // Support both single image (backward compatibility) and images array
    let imageArray: string[] = [];
    
    if (images) {
      // If images is provided, use it (ensure it's an array and flatten if nested)
      imageArray = Array.isArray(images) ? images.flat().filter((img): img is string => typeof img === "string") : [];
    } else if (image) {
      // Backward compatibility: single image
      imageArray = Array.isArray(image) ? image.flat().filter((img): img is string => typeof img === "string") : [image];
    }

    if (imageArray.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
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
      result = await analyzeFoodImageGemini(imageArray, session.user.id, context, modelId);
    } else {
      result = await analyzeFoodImage(imageArray, session.user.id, context);
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
