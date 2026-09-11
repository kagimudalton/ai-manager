import { db } from "@/lib/db";

export async function computeStreak(userId: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [progress, tasks, messages] = await Promise.all([
    db.learningProgress.findMany({ where: { userId, updatedAt: { gte: since } }, select: { updatedAt: true } }),
    db.task.findMany({ where: { completedAt: { gte: since }, milestone: { goal: { userId } } }, select: { completedAt: true } }),
    db.aIMessage.findMany({ where: { conversation: { userId }, createdAt: { gte: since }, role: "user" }, select: { createdAt: true } }),
  ]);

  const dayKeys = new Set<string>();
  const addDay = (d: Date | null) => { if (d) dayKeys.add(d.toISOString().slice(0, 10)); };
  progress.forEach((p) => addDay(p.updatedAt));
  tasks.forEach((t) => addDay(t.completedAt));
  messages.forEach((m) => addDay(m.createdAt));

  const todayKey = new Date().toISOString().slice(0, 10);
  const cursor = new Date();
  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}