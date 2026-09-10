import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ interests: z.array(z.string()).min(1) });

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await db.userProfile.update({
      where: { userId },
      data: { interests: parsed.data.interests },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to save interests" }, { status: 500 });
  }
}