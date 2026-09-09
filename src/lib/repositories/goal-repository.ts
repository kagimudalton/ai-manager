import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// The repository layer is the ONLY place raw Prisma queries live.
// Services call this; API routes call services; UI never touches
// this file directly. Keeps the "don't blindly send the whole
// database to the LLM" and "don't put business logic in UI" rules
// from the architecture doc structurally enforced, not just a convention.

const goalWithRelations = {
  include: {
    milestones: {
      orderBy: { order: "asc" as const },
      include: { tasks: { orderBy: { order: "asc" as const } } },
    },
  },
} satisfies Prisma.GoalDefaultArgs;

export type GoalWithRelations = Prisma.GoalGetPayload<typeof goalWithRelations>;

export async function findGoalsByUser(userId: string): Promise<GoalWithRelations[]> {
  return db.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    ...goalWithRelations,
  });
}

export async function findGoalById(goalId: string, userId: string): Promise<GoalWithRelations | null> {
  return db.goal.findFirst({
    where: { id: goalId, userId },
    ...goalWithRelations,
  });
}

export async function createGoal(userId: string, title: string, objective?: string) {
  return db.goal.create({
    data: { userId, title, objective },
    ...goalWithRelations,
  });
}

export async function setGoalStrategy(goalId: string, userId: string, strategy: string[]) {
  // Scoping the update to userId too (not just goalId) prevents one user
  // from mutating another user's goal even if they guess a valid goal id.
  return db.goal.updateMany({
    where: { id: goalId, userId },
    data: { strategy },
  });
}

export async function setTaskDone(taskId: string, userId: string, done: boolean) {
  const task = await db.task.findFirst({
    where: { id: taskId, milestone: { goal: { userId } } },
  });
  if (!task) return null;

  return db.task.update({
    where: { id: taskId },
    data: { done, completedAt: done ? new Date() : null },
  });
}

export async function findNextIncompleteTask(userId: string, goalId: string) {
  return db.task.findFirst({
    where: { done: false, milestone: { goalId, goal: { userId } } },
    orderBy: [{ milestone: { order: "asc" } }, { order: "asc" }],
  });
}
