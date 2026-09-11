import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GenerateLessonBox } from "@/components/ui/generate-lesson-box";
import Link from "next/link";

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/onboarding");

  const [profile, myProgress, allSubjects] = await Promise.all([
    db.userProfile.findUnique({ where: { userId } }),
    db.learningProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { lesson: { include: { subject: true } } },
    }),
    db.learningSubject.findMany({
      where: { NOT: { category: "Custom" } },
      include: { lessons: { orderBy: { order: "asc" } } },
    }),
  ]);

  const myLessonIds = new Set(myProgress.map((p) => p.lessonId));
  const heroSeed = profile?.interests[0] ?? "learning journey";

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        <img src={`https://picsum.photos/seed/${encodeURIComponent(heroSeed)}/900/400`} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Learn</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Keep building your skills</h1>
        </div>
      </div>

      <GenerateLessonBox />

      {myProgress.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Your lessons</p>
          <div className="space-y-3">
            {myProgress.map((p, i) => (
              <Card key={p.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
                <Link href={`/learn/${p.lessonId}`} className="block">
                  <p className="text-xs text-muted mb-1">{p.lesson.subject.name}</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text">{p.lesson.title}</span>
                    <span className="text-xs font-mono text-muted">{p.percentComplete}%</span>
                  </div>
                  <ProgressBar percent={p.percentComplete} color="var(--teal)" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Explore the catalog</p>
        <div className="space-y-3">
          {allSubjects.filter((s) => s.lessons.length > 0).map((subject, i) => (
            <Card key={subject.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-1">{subject.category}</p>
              <p className="font-semibold text-text mb-2">{subject.name}</p>
              <div className="space-y-1">
                {subject.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.id}`}
                    className="block text-sm py-1"
                    style={{ color: myLessonIds.has(lesson.id) ? "var(--muted)" : "var(--accent)" }}
                  >
                    {lesson.title}
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}