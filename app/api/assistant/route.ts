import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOpenAIClient, categorizeOpenAIError, NoApiKeyError } from "@/lib/openai";
import { generateChatCompletion, getUserGeminiModel } from "@/lib/gemini";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check user's preferred provider
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { preferredProvider: true, preferredGeminiModel: true },
    });

    const provider = user?.preferredProvider || "openai";

    const contextPrompt = context
      ? `Current step: ${context.step}. User is setting their ${context.currentGoal || "goals"}.`
      : "";

    const fullMessage = contextPrompt
      ? `${contextPrompt}\n\nUser question: ${message}`
      : message;

    const systemPrompt = `You are a concise nutrition advisor helping users set daily macro goals. Your responses must be:
- Maximum 2 sentences
- Direct and actionable
- Based on scientific guidelines

When users ask about calories: Consider their goals (lose/maintain/gain weight), activity level, and typical ranges (1500-2500 for most adults).

When users ask about protein: Recommend 0.8-1g per pound of body weight for active individuals, 0.5-0.7g for sedentary.

When users ask about carbs: 45-65% of daily calories typically, lower for keto/low-carb goals.

When users ask about fat: 20-35% of daily calories, prioritize healthy fats.

When users ask about API keys: Explain that adding their own key is required to use AI features. Their key is encrypted and stored securely, and they're billed directly by the provider with no markup.

If the user hasn't provided enough context, ask ONE clarifying question. Never give medical advice - suggest consulting a professional for health conditions.`;

    let responseText: string;

    // Route to correct provider
    if (provider === "google") {
      const modelId = user?.preferredGeminiModel || "gemini-2.5-flash";
      responseText = await generateChatCompletion(session.user.id, systemPrompt, fullMessage, modelId);
    } else {
      // User's API key is REQUIRED - no fallback
      const { client } = await getOpenAIClient(session.user.id);

      const response = await client.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullMessage },
        ],
        max_tokens: 150,
      });

      responseText = response.choices[0]?.message?.content || "I couldn't generate a response.";
    }

    return NextResponse.json({
      response: responseText,
      success: true,
    });
  } catch (error) {
    console.error("Agent error:", error);

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
