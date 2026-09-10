"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function GenerateLessonBox() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't generate that lesson - try again.");
        setLoading(false);
        return;
      }
      router.push(`/learn/${data.lessonId}`);
    } catch {
      setError("Something went wrong - please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl p-4 border mb-5" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={14} style={{ color: "var(--brass)" }} />
        <p className="text-xs font-mono uppercase tracking-widest text-muted">Learn something new</p>
      </div>
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Type any topic - baking, guitar, budgeting..."
          disabled={loading}
          className="flex-1 text-sm rounded-xl border px-3 py-2.5 outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
        >
          {loading ? "..." : "Go"}
        </button>
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  );
}