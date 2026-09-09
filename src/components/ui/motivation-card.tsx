"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export function MotivationCard({ streakDays, strategy }: { streakDays: number; strategy: string[] }) {
  const [open, setOpen] = useState(false);
  const lines = [
    `${streakDays} days in a row. The compounding starts right about now.`,
    "Consistency beats intensity - you're proving that this week.",
    "Small steps, repeated daily, beat big plans that never start.",
  ];
  const line = lines[streakDays % lines.length];

  return (
    <Card className="animate-fadeInUp">
      <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Motivation</p>
      <p className="text-base font-semibold text-text mb-3">{line}</p>

      {strategy.length > 0 && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            <span>{open ? "Hide strategy" : "How does the AI suggest I get there?"}</span>
            <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {open && (
            <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
              {strategy.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm text-muted">
                  <span className="font-mono shrink-0" style={{ color: "var(--brass)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{s}</span>
                </div>
              ))}
              <p className="text-xs font-mono text-muted pt-1">Recommendation only - nothing here has been scheduled yet.</p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}