"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/states";
import { Bookmark, X, ChevronDown, ExternalLink } from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  org: string;
  type: string;
  deadline: string | null;
  location: string | null;
  eligibility: string | null;
  description: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
  status: "saved" | "dismissed" | null;
};

const TYPES = ["all", "job", "fellowship", "internship", "hackathon", "scholarship", "grant"];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/opportunities");
      if (!res.ok) {
        throw new Error("Request failed");
      }
      const data = await res.json();
      setOpportunities(data.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: "saved" | "dismissed") {
    const previous = opportunities;
    setOpportunities((current) => {
      if (!current) return current;
      if (status === "dismissed") {
        return current.filter((o) => o.id !== id);
      }
      return current.map((o) => (o.id === id ? { ...o, status } : o));
    });
    try {
      const saveUrl = "/api/opportunities/" + id + "/save";
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
    } catch {
      setOpportunities(previous ?? null);
      setError("Could not save that change - please try again.");
    }
  }

  if (error && !opportunities) {
    return <ErrorState message={error} onRetry={load} />;
  }
  if (!opportunities) {
    return <LoadingState label="Loading opportunities..." />;
  }

  const visible = opportunities.filter((o) => filter === "all" || o.type === filter);

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        <img src="https://picsum.photos/seed/opportunities-open/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Opportunities</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Real listings, updated live</h1>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 animate-fadeInUp">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="text-xs font-mono px-3 py-1.5 rounded-full border shrink-0 capitalize"
            style={
              filter === t
                ? { backgroundColor: "var(--ink)", borderColor: "var(--ink)", color: "var(--ink-text)" }
                : { backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      {visible.length === 0 && (
        <EmptyState title="Nothing here" description="Try a different filter, or check back later." />
      )}

      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((o, i) => {
            const expanded = expandedId === o.id;
            const delayStyle = { animationDelay: (i * 70) + "ms" };
            return (
              <Card key={o.id} className="animate-fadeInUp" style={delayStyle}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full capitalize" style={{ color: "var(--accent)", backgroundColor: "var(--accent-soft)" }}>
                      {o.type}
                    </span>
                    <p className="font-semibold text-text mt-1.5">{o.title}</p>
                    <p className="text-xs text-muted">{o.org}</p>
                  </div>
                  <button onClick={() => setStatus(o.id, "saved")}>
                    <Bookmark size={18} style={o.status === "saved" ? { color: "var(--brass)", fill: "var(--brass)" } : { color: "var(--muted)" }} />
                  </button>
                </div>

                {o.location && <p className="text-xs text-muted mt-2">{o.location}</p>}

                <button
                  onClick={() => setExpandedId(expanded ? null : o.id)}
                  className="w-full flex items-center justify-between text-xs font-medium mt-3 pt-3 border-t"
                  style={{ borderColor: "var(--border)", color: "var(--accent)" }}
                >
                  <span>{expanded ? "Hide details" : "View details"}</span>
                  <ChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                {expanded && (
                  <div className="mt-3 space-y-2 text-sm text-muted">
                    {o.description && <p>{o.description}</p>}
                    {o.eligibility && (
                      <p>
                        <span className="font-medium text-text">Type: </span>
                        {o.eligibility}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {o.sourceUrl && (
                    <a
                      href={o.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-xl py-2"
                      style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
                    >
                      Apply <ExternalLink size={13} />
                    </a>
                  )}
                  {!o.sourceUrl && (
                    <button
                      onClick={() => setStatus(o.id, "saved")}
                      className="flex-1 text-sm font-medium rounded-xl py-2"
                      style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
                    >
                      Save
                    </button>
                  )}
                  <button
                    onClick={() => setStatus(o.id, "dismissed")}
                    className="flex items-center justify-center gap-1 text-sm font-medium border rounded-xl px-3 py-2"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <X size={14} /> Dismiss
                  </button>
                </div>
                <p className="text-xs font-mono mt-2 text-muted">[{o.sourceLabel}]</p>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}