import { NextResponse } from "next/server";
import { requireUserId, AuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateLessonSteps } from "@/lib/ai/lesson-generator";

export async function POST() {
  try {
    const userId = await requireUserId();
    const profile = await db.userProfile.findUnique({ where: { userId } });
    const interests = profile?.interests ?? [];
    const firstInterest = interests[0] ?? "getting started with this app";

    try {
      const steps = await generateLessonSteps(firstInterest);
      const subject = await db.learningSubject.upsert({
        where: { name: firstInterest },
        update: {},
        create: { name: firstInterest, category: "Custom" },
      });
      const lesson = await db.lesson.create({
        data: { subjectId: subject.id, title: firstInterest, order: 0, content: { steps } },
      });
      await db.learningProgress.create({ data: { userId, lessonId: lesson.id, percentComplete: 0 } });
    } catch (e) {
      console.error("Bootstrap lesson generation failed:", e);
    }

    const existingGoal = await db.goal.findFirst({ where: { userId } });
    if (!existingGoal) {
      const goal = await db.goal.create({
        data: {
          userId,
          title: `Get started with ${firstInterest}`,
          objective: `A gentle first goal to help you build momentum with ${firstInterest}.`,
          strategy: [
            "Start with your first lesson - just 10-15 minutes.",
            "Check back tomorrow to keep a streak going.",
            "Explore Opportunities and Community when you're ready.",
          ],
        },
      });
      const milestone = await db.milestone.create({
        data: { goalId: goal.id, title: "First steps", order: 0 },
      });
      await db.task.createMany({
        data: [
          { milestoneId: milestone.id, title: "Complete your first lesson", order: 0 },
          { milestoneId: milestone.id, title: "Look at Opportunities", order: 1 },
          { milestoneId: milestone.id, title: "Say hi in Community", order: 2 },
        ],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Failed to set up dashboard" }, { status: 500 });
  }
}