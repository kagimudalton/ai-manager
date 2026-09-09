import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({ percentComplete: z.number().min(0).max(100) });

export async function PATCH(request: Request, { params }: { params: { lessonId: string } }) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const progress = await db.learningProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: params.lessonId } },
      update: {
        percentComplete: parsed.data.percentComplete,
        completedAt: parsed.data.percentComplete >= 100 ? new Date() : null,
      },
      create: {
        userId,
        lessonId: params.lessonId,
        percentComplete: parsed.data.percentComplete,
        completedAt: parsed.data.percentComplete >= 100 ? new Date() : null,
      },
    });

    return NextResponse.json({ progress });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}