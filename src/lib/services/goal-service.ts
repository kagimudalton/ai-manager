import * as goalRepo from "@/lib/repositories/goal-repository";
import type { GoalWithRelations } from "@/lib/repositories/goal-repository";
import type { GoalDTO } from "@/types";

function toDTO(goal: GoalWithRelations): GoalDTO {
  const allTasks = goal.milestones.flatMap((m) => m.tasks);
  const done = allTasks.filter((t) => t.done).length;
  const progressPercent = allTasks.length === 0 ? 0 : Math.round((done / allTasks.length) * 100);

  return {
    id: goal.id,
    title: goal.title,
    objective: goal.objective,
    strategy: goal.strategy,
    milestones: goal.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      tasks: m.tasks.map((t) => ({ id: t.id, title: t.title, done: t.done, order: t.order })),
    })),
    progressPercent,
  };
}

export async function getUserGoals(userId: string): Promise<GoalDTO[]> {
  const goals = await goalRepo.findGoalsByUser(userId);
  return goals.map(toDTO);
}

export async function getGoal(goalId: string, userId: string): Promise<GoalDTO | null> {
  const goal = await goalRepo.findGoalById(goalId, userId);
  return goal ? toDTO(goal) : null;
}

export async function toggleTask(taskId: string, userId: string, done: boolean) {
  const updated = await goalRepo.setTaskDone(taskId, userId, done);
  if (!updated) {
    throw new Error("Task not found or does not belong to this user");
  }
  return updated;
}

// Used by the AI Manager's "completeTask" action — marks the single
// next incomplete task done, mirroring the artifact prototype's
// markNextTaskDone() but backed by a real database write.
export async function completeNextTask(userId: string, goalId: string) {
  const task = await goalRepo.findNextIncompleteTask(userId, goalId);
  if (!task) return null;
  return goalRepo.setTaskDone(task.id, userId, true);
}

export async function remainingTaskCount(userId: string, goal: GoalDTO): Promise<number> {
  return goal.milestones.flatMap((m) => m.tasks).filter((t) => !t.done).length;
}
