import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/states";

export default async function CareerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/onboarding");

  const [careerProfile, userSkills] = await Promise.all([
    db.careerProfile.findUnique({ where: { userId } }),
    db.userSkill.findMany({ where: { userId }, include: { skill: true }, orderBy: { proficiency: "asc" } }),
  ]);

  if (!careerProfile) {
    return (
      <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-6">
        <EmptyState title="No career profile yet" description="Set a dream career to start tracking readiness and skill gaps." />
      </main>
    );
  }

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${encodeURIComponent(careerProfile.targetCareer)}/900/400`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }}
        />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Career</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{careerProfile.targetCareer}</h1>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="animate-fadeInUp" style={{ animationDelay: "70ms" }}>
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-1">Career readiness</p>
          <ProgressBar percent={careerProfile.careerReadiness} />
          <p className="text-xs text-muted mt-1">{careerProfile.careerReadiness}% ready</p>
        </Card>

        <Card className="animate-fadeInUp" style={{ animationDelay: "140ms" }}>
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Skill gaps</p>
          {userSkills.length === 0 ? (
            <p className="text-sm text-muted">No skills tracked yet.</p>
          ) : (
            <div className="space-y-3">
              {userSkills.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text">{s.skill.name}</span>
                    <span className="text-xs font-mono text-muted">{s.proficiency}%</span>
                  </div>
                  <ProgressBar percent={s.proficiency} color={s.proficiency < 50 ? "var(--brass)" : "var(--teal)"} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}