import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { LessonStepper } from "@/components/ui/lesson-stepper";

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/onboarding");

  const lesson = await db.lesson.findUnique({
    where: { id: params.lessonId },
    include: { subject: true },
  });
  if (!lesson) notFound();

  const progress = await db.learningProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });
  const percent = progress?.percentComplete ?? 0;

  const content = lesson.content as { steps?: { type: string; body?: string; prompt?: string; options?: string[]; correctIndex?: number; explanation?: string }[] };
  const steps = content.steps ?? [{ type: "concept", body: "No content yet for this lesson." }];

  return (
    <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-4">
      <p className="text-xs font-mono uppercase tracking-widest text-muted">{lesson.subject.name}</p>
      <h1 className="text-2xl font-bold text-text">{lesson.title}</h1>

      <LessonStepper lessonId={lesson.id} subjectName={lesson.subject.name} steps={steps} initialPercent={percent} />
    </main>
  );
}