import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

// GET: Check if user has an API key and return masked version
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasKey: !!user.encryptedApiKey,
      maskedKey: user.apiKeyLastFour ? `sk-...${user.apiKeyLastFour}` : null,
      addedAt: user.apiKeyAddedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching API key status:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key status" },
      { status: 500 }
    );
  }
}

// POST: Save a new API key (no format validation - accept any key)
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

    const trimmedKey = apiKey.trim();

    // Encrypt and store the key - no validation, just save it
    const encryptedKey = encrypt(trimmedKey);
    const lastFour = trimmedKey.slice(-4);

    await db
      .update(users)
      .set({
        encryptedApiKey: encryptedKey,
        apiKeyLastFour: lastFour,
        apiKeyAddedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      maskedKey: `...${lastFour}`,
    });
  } catch (error) {
    console.error("Error saving API key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

// DELETE: Remove API key
export async function DELETE() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db
      .update(users)
      .set({
        encryptedApiKey: null,
        apiKeyLastFour: null,
        apiKeyAddedAt: null,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing API key:", error);
    return NextResponse.json(
      { error: "Failed to remove API key" },
      { status: 500 }
    );
  }
}

