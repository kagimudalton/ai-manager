import { db } from "@/lib/db";
import { getUserGoals } from "@/lib/services/goal-service";
import type { AIContext } from "@/types";

// This is the single place that decides what a user's data looks like to
// the LLM. It intentionally does NOT select * from every table — it pulls
// exactly what's needed for a chat turn, and it hard-enforces the AI memory
// toggles from Settings server-side. A client-side toggle that isn't
// enforced here would be a mock-vs-real violation, not a real permission.
export async function buildChatContext(userId: string): Promise<AIContext> {
  const [user, profile, preferences, careerProfile, userSkills, goals, latestProgress] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId } }),
    db.userProfile.findUnique({ where: { userId } }),
    db.userPreference.findUnique({ where: { userId } }),
    db.careerProfile.findUnique({ where: { userId } }),
    db.userSkill.findMany({ where: { userId }, include: { skill: true } }),
    getUserGoals(userId),
    db.learningProgress.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { lesson: { include: { subject: true } } },
    }),
  ]);

  const context: AIContext = {
    userName: user.name,
    interests: profile?.interests ?? [],
  };

  const canUseCareer = preferences?.aiCanUseCareer ?? true;
  const canUseLearning = preferences?.aiCanUseLearning ?? true;
  const canUseGoals = preferences?.aiCanUseGoals ?? true;

  if (canUseCareer && careerProfile) {
    context.career = {
      targetCareer: careerProfile.targetCareer,
      careerReadiness: careerProfile.careerReadiness,
      skills: userSkills.map((s) => ({ name: s.skill.name, proficiency: s.proficiency })),
    };
  }

  if (canUseLearning && latestProgress) {
    context.learning = {
      lessonId: latestProgress.lessonId,
      lessonTitle: latestProgress.lesson.title,
      subject: latestProgress.lesson.subject.name,
      percentComplete: latestProgress.percentComplete,
    };
  }

  if (canUseGoals && goals.length > 0) {
    // Most recently created / most relevant goal — keep the context small.
    context.goal = goals[0];
  }

  return context;
}
