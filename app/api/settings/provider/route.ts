import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET: Return current provider preference
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { preferredProvider: true },
    });

    return NextResponse.json({
      provider: user?.preferredProvider || "openai",
    });
  } catch (error) {
    console.error("Error fetching provider preference:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider preference" },
      { status: 500 }
    );
  }
}

// PUT: Update user's preferredProvider preference
export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { provider } = await request.json();

    if (provider !== "openai" && provider !== "google") {
      return NextResponse.json(
        { error: "Invalid provider. Must be 'openai' or 'google'" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        preferredProvider: provider,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error("Error updating provider preference:", error);
    return NextResponse.json(
      { error: "Failed to update provider preference" },
      { status: 500 }
    );
  }
}

