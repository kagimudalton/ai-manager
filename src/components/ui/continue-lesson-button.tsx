"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContinueLessonButton({ lessonId, currentPercent }: { lessonId: string; currentPercent: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const done = currentPercent >= 100;

  async function handleContinue() {
    setSaving(true);
    const next = Math.min(100, currentPercent + 20);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentComplete: next }),
      });
      if (!res.ok) throw new Error("Failed to save progress");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={handleContinue}
      disabled={saving || done}
      className="w-full rounded-xl py-3 text-sm font-medium disabled:opacity-50"
      style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
    >
      {done ? "Lesson complete" : saving ? "Saving..." : "Continue lesson (+20%)"}
    </button>
  );
}