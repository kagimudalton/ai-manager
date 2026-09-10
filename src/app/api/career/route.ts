import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ targetCareer: z.string().min(1).max(200) });

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const profile = await db.careerProfile.upsert({
      where: { userId },
      update: { targetCareer: parsed.data.targetCareer },
      create: { userId, targetCareer: parsed.data.targetCareer, careerReadiness: 0 },
    });

    return NextResponse.json({ profile });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to save career target" }, { status: 500 });
  }
}