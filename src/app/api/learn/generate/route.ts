import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateLessonSteps } from "@/lib/ai/lesson-generator";

const schema = z.object({ topic: z.string().min(2).max(100) });

export async function POST(request: Request) {
  try {
    await requireUserId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const steps = await generateLessonSteps(parsed.data.topic);

    const subject = await db.learningSubject.upsert({
      where: { name: parsed.data.topic },
      update: {},
      create: { name: parsed.data.topic, category: "Custom" },
    });

    const lesson = await db.lesson.create({
      data: { subjectId: subject.id, title: parsed.data.topic, order: 0, content: { steps } },
    });

    return NextResponse.json({ lessonId: lesson.id });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to generate lesson - please try again" }, { status: 500 });
  }
}