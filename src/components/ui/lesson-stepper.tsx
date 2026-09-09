"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

type Step = { type: string; body?: string; prompt?: string };

export function LessonStepper({
  lessonId,
  steps,
  initialPercent,
}: {
  lessonId: string;
  steps: Step[];
  initialPercent: number;
}) {
  const router = useRouter();
  // Resume at whichever step roughly matches saved progress, so refreshing
  // the page doesn't reset you back to the very first step.
  const startIndex = Math.min(steps.length - 1, Math.floor((initialPercent / 100) * steps.length));
  const [index, setIndex] = useState(Math.max(0, startIndex));
  const [saving, setSaving] = useState(false);

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const percent = Math.round(((index + 1) / steps.length) * 100);

  async function saveProgress(newPercent: number) {
    setSaving(true);
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentComplete: newPercent }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (isLast) {
      await saveProgress(100);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    await saveProgress(Math.round(((nextIndex + 1) / steps.length) * 100));
  }

  function handleBack() {
    setIndex((i) => Math.max(0, i - 1));
  }

  const done = initialPercent >= 100 && isLast;

  return (
    <div className="space-y-4">
      <ProgressBar percent={done ? 100 : percent} color="var(--teal)" />
      <p className="text-xs text-muted">
        Step {index + 1} of {steps.length}
      </p>

      <Card key={index}>
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">{step.type}</p>
        <p className="text-sm text-text">{step.body ?? step.prompt}</p>
      </Card>

      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          disabled={index === 0}
          className="px-4 py-3 rounded-xl border text-sm font-medium disabled:opacity-30"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={saving || done}
          className="flex-1 rounded-xl py-3 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
        >
          {done ? "Lesson complete" : saving ? "Saving..." : isLast ? "Finish lesson" : "Continue"}
        </button>
      </div>
    </div>
  );
}