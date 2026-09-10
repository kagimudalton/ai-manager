import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserGoals } from "@/lib/services/goal-service";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MotivationCard } from "@/components/ui/motivation-card";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/onboarding");

  const [user, careerProfile, latestProgress, goals] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    db.careerProfile.findUnique({ where: { userId } }),
    db.learningProgress.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { lesson: { include: { subject: true } } },
    }),
    getUserGoals(userId),
  ]);

  const activeGoal = goals[0];
  const heroSeed = careerProfile?.targetCareer ?? user.name;
  const isBrandNew = !careerProfile && !latestProgress && !activeGoal;

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-40 sm:h-48 mb-5 animate-fadeInUp">
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(heroSeed)}/900/500`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5">Welcome back, {user.name}</h1>
        </div>
      </div>

      <div className="space-y-4">
        {isBrandNew && (
          <Card className="animate-fadeInUp">
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Get started</p>
            <p className="font-semibold text-text mb-2">Nothing here yet - and that's normal for a new account.</p>
            <p className="text-sm text-muted mb-4">
              Tell your AI Manager what you're working toward, and it'll help you set up a goal, a first lesson, or a career target.
            </p>
            <Link
              href="/ai"
              className="block text-center rounded-xl py-3 font-medium text-sm"
              style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
            >
              Talk to your AI Manager
            </Link>
          </Card>
        )}

        {careerProfile && (
          <Card className="animate-fadeInUp" style={{ animationDelay: "70ms" }}>
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Career snapshot</p>
            <p className="font-semibold text-text">{careerProfile.targetCareer}</p>
            <div className="mt-2">
              <ProgressBar percent={careerProfile.careerReadiness} />
              <p className="text-xs text-muted mt-1">{careerProfile.careerReadiness}% career readiness</p>
            </div>
          </Card>
        )}

        {latestProgress && (
          <Card className="animate-fadeInUp" style={{ animationDelay: "140ms" }}>
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Continue learning</p>
            <p className="font-semibold text-text">{latestProgress.lesson.title}</p>
            <p className="text-xs text-muted mb-2">{latestProgress.lesson.subject.name}</p>
            <ProgressBar percent={latestProgress.percentComplete} color="var(--teal)" />
            <Link href={`/learn/${latestProgress.lessonId}`} className="text-xs font-medium text-accent mt-2 inline-block">
              Resume lesson
            </Link>
          </Card>
        )}

        {!latestProgress && !isBrandNew && (
          <Card className="animate-fadeInUp" style={{ animationDelay: "140ms" }}>
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Learn</p>
            <p className="text-sm text-muted mb-3">You haven't started a lesson yet.</p>
            <Link href="/learn" className="text-xs font-medium text-accent">
              Browse lessons
            </Link>
          </Card>
        )}

        {activeGoal && (
          <Card className="animate-fadeInUp" style={{ animationDelay: "210ms" }}>
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Active goal</p>
            <p className="font-semibold text-text">{activeGoal.title}</p>
            <div className="mt-2">
              <ProgressBar percent={activeGoal.progressPercent} color="var(--brass)" />
              <p className="text-xs text-muted mt-1">{activeGoal.progressPercent}% complete</p>
            </div>
            <Link href="/goals" className="text-xs font-medium text-accent mt-2 inline-block">
              Open goal
            </Link>
          </Card>
        )}

        {activeGoal && <MotivationCard streakDays={7} strategy={activeGoal.strategy} />}

        <Link
          href="/ai"
          className="block rounded-2xl p-4 text-center font-medium"
          style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
        >
          Ask your AI Manager
        </Link>
      </div>
    </main>
  );
}