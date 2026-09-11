"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, Flame } from "lucide-react";

export function MotivationCard({ streak, advice, strategy }: { streak: number; advice: string | null; strategy: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="animate-fadeInUp">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono uppercase tracking-widest text-muted">Motivation</p>
        <div className="flex items-center gap-1 rounded-full px-2.5 py-1 border" style={{ borderColor: "var(--border)" }}>
          <Flame size={13} style={{ color: streak > 0 ? "var(--brass)" : "var(--muted)" }} />
          <span className="text-xs font-mono font-medium text-text">{streak} day{streak === 1 ? "" : "s"}</span>
        </div>
      </div>

      <p className="text-base font-semibold text-text mb-1">
        {streak === 0 ? "Today's a good day to start." : `${streak} day streak - keep it going.`}
      </p>

      {advice && (
        <p className="text-sm text-muted mb-3 italic">"{advice}"</p>
      )}

      {strategy.length > 0 && (
        <>
          <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-sm font-medium" style={{ color: "var(--accent)" }}>
            <span>{open ? "Hide strategy" : "How does the AI suggest I get there?"}</span>
            <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {open && (
            <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
              {strategy.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm text-muted">
                  <span className="font-mono shrink-0" style={{ color: "var(--brass)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}