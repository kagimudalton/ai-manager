"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/states";
import type { GoalDTO } from "@/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setGoals(data.goals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleTask(goalId: string, taskId: string, done: boolean) {
    const previous = goals;
    setGoals((current) =>
      current?.map((g) =>
        g.id !== goalId
          ? g
          : {
              ...g,
              milestones: g.milestones.map((m) => ({
                ...m,
                tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done } : t)),
              })),
            }
      ) ?? null
    );

    try {
      const res = await fetch(`/api/goals/${goalId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch {
      setGoals(previous ?? null);
      setError("Couldn't save that change - please try again.");
    }
  }

  if (error && !goals) return <ErrorState message={error} onRetry={load} />;
  if (!goals) return <LoadingState label="Loading your goals..." />;

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://picsum.photos/seed/goals-path/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }}
        />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Goals</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Where you're headed</h1>
        </div>
      </div>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      {goals.length === 0 ? (
        <EmptyState title="No goals yet" description="Ask your AI Manager to help you set your first goal." />
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => (
            <Card key={goal.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-text">{goal.title}</p>
                <span className="text-xs font-mono text-muted">{goal.progressPercent}%</span>
              </div>
              {goal.objective && <p className="text-sm text-muted mb-3">{goal.objective}</p>}
              <ProgressBar percent={goal.progressPercent} color="var(--brass)" />

              <div className="mt-4 space-y-3">
                {goal.milestones.map((milestone) => (
                  <div key={milestone.id}>
                    <p className="text-xs font-medium text-muted mb-1.5">{milestone.title}</p>
                    <div className="space-y-1.5">
                      {milestone.tasks.map((task) => (
                        <label key={task.id} className="flex items-center gap-2 text-sm cursor-pointer text-text">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={(e) => toggleTask(goal.id, task.id, e.target.checked)}
                            className="w-4 h-4 rounded border-border accent-[var(--accent)]"
                          />
                          <span className={task.done ? "line-through text-muted" : ""}>{task.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}