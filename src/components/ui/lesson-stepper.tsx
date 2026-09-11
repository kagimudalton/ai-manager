"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Check, X, RotateCcw, ArrowRight } from "lucide-react";

type Step = { type: string; body?: string; prompt?: string; options?: string[]; correctIndex?: number; explanation?: string };

export function LessonStepper({
  lessonId,
  subjectName,
  steps,
  initialPercent,
}: {
  lessonId: string;
  subjectName: string;
  steps: Step[];
  initialPercent: number;
}) {
  const router = useRouter();
  const startIndex = Math.min(steps.length - 1, Math.floor((initialPercent / 100) * steps.length));
  const [index, setIndex] = useState(Math.max(0, startIndex));
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(initialPercent >= 100);
  const [generatingNext, setGeneratingNext] = useState(false);

  const step = steps[index] ?? steps[0] ?? { type: "concept", body: "No content available." };
  const isLast = index === steps.length - 1;
  const percent = Math.round(((index + 1) / steps.length) * 100);
  const hasQuestion = Boolean(step.options && step.options.length > 0);
  const canAdvance = !hasQuestion || selected !== null;

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
    setSelected(null);
    if (isLast) {
      await saveProgress(100);
      setFinished(true);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    await saveProgress(Math.round(((nextIndex + 1) / steps.length) * 100));
  }

  function handleBack() {
    setSelected(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  function handleReview() {
    setFinished(false);
    setIndex(0);
    setSelected(null);
  }

  async function handleKeepLearning() {
    setGeneratingNext(true);
    try {
      const res = await fetch("/api/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: subjectName }),
      });
      const data = await res.json();
      if (res.ok && data.lessonId) {
        router.push(`/learn/${data.lessonId}`);
      }
    } finally {
      setGeneratingNext(false);
    }
  }

  if (finished) {
    return (
      <div className="text-center py-8 animate-fadeInUp">
        <p className="text-lg font-bold text-text mb-1">Lesson complete</p>
        <p className="text-sm text-muted mb-6">Nice work on {subjectName}.</p>
        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <button onClick={handleReview} className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
            <RotateCcw size={15} /> Review this lesson
          </button>
          <button
            onClick={handleKeepLearning}
            disabled={generatingNext}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
          >
            {generatingNext ? "Generating your next lesson..." : `Keep learning ${subjectName}`}
            {!generatingNext && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressBar percent={percent} color="var(--teal)" />
      <p className="text-xs text-muted">Step {index + 1} of {steps.length}</p>

      <Card key={index}>
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">{step.type}</p>
        <p className="text-sm text-text mb-3">{step.body ?? step.prompt}</p>

        {hasQuestion && (
          <div className="space-y-2">
            {step.options!.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === step.correctIndex;
              const showState = selected !== null;
              let style: React.CSSProperties = { borderColor: "var(--border)", backgroundColor: "var(--surface-alt)" };
              if (showState && isCorrect) style = { borderColor: "var(--teal)", backgroundColor: "var(--teal-soft)" };
              else if (showState && isSelected && !isCorrect) style = { borderColor: "var(--danger)", backgroundColor: "var(--danger-soft)" };

              return (
                <button
                  key={i}
                  onClick={() => selected === null && setSelected(i)}
                  disabled={selected !== null}
                  className="w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center justify-between text-text"
                  style={style}
                >
                  <span>{opt}</span>
                  {showState && isCorrect && <Check size={16} style={{ color: "var(--teal)" }} />}
                  {showState && isSelected && !isCorrect && <X size={16} style={{ color: "var(--danger)" }} />}
                </button>
              );
            })}
            {selected !== null && step.explanation && (
              <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: "var(--surface-alt)" }}>
                <p className="text-sm text-muted">{step.explanation}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex items-center gap-3">
        <button onClick={handleBack} disabled={index === 0} className="px-4 py-3 rounded-xl border text-sm font-medium disabled:opacity-30" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={saving || !canAdvance}
          className="flex-1 rounded-xl py-3 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
        >
          {saving ? "Saving..." : isLast ? "Finish lesson" : "Continue"}
        </button>
      </div>
    </div>
  );
}