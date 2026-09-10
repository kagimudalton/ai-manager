import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ topic: z.string().min(2).max(100) });

async function generateLessonSteps(topic: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = `Create a short beginner lesson about "${topic}" for a general audience (not just programmers - could be anyone). Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{"steps": [
  {"type": "concept", "body": "one clear paragraph explaining the core idea"},
  {"type": "practice", "prompt": "a multiple choice question testing the concept", "options": ["option A", "option B", "option C"], "correctIndex": 0, "explanation": "why that answer is correct"}
]}`;

  const url = "https://generativelanguage.googleapis.com/v1beta/interactions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ model: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview", input: prompt }),
  });
  if (!res.ok) throw new Error("Gemini request failed: " + res.status);

  const data = await res.json();
  const modelStep = (data.steps ?? []).find((s: any) => s.type === "model_output");
  const rawText = modelStep?.content?.find((c: any) => c.type === "text")?.text;
  if (!rawText) throw new Error("No content generated");

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.steps;
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
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