import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/states";
import Link from "next/link";

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/onboarding");

  const subjects = await db.learningSubject.findMany({
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { progress: { where: { userId } } },
      },
    },
  });

  const activeSubjects = subjects.filter((s) => s.lessons.length > 0);

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://picsum.photos/seed/learn-together/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }}
        />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Learn</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Keep building your skills</h1>
        </div>
      </div>

      {activeSubjects.length === 0 ? (
        <EmptyState title="No lessons yet" description="Ask your AI Manager to help you start a learning path." />
      ) : (
        <div className="space-y-4">
          {activeSubjects.map((subject, i) => (
            <Card key={subject.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 70}ms` }}>
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-1">{subject.category}</p>
              <p className="font-semibold text-text mb-3">{subject.name}</p>

              <div className="space-y-3">
                {subject.lessons.map((lesson) => {
                  const percent = lesson.progress[0]?.percentComplete ?? 0;
                  return (
                    <Link key={lesson.id} href={`/learn/${lesson.id}`} className="block">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text">{lesson.title}</span>
                        <span className="text-xs font-mono text-muted">{percent}%</span>
                      </div>
                      <ProgressBar percent={percent} color="var(--teal)" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}