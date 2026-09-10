"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingState } from "@/components/ui/states";

type CareerData = {
  careerProfile: { targetCareer: string; careerReadiness: number } | null;
  skills: { id: string; proficiency: number; skill: { name: string } }[];
};

export default function CareerPage() {
  const router = useRouter();
  const [data, setData] = useState<CareerData | null>(null);
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/career/me");
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSetCareer(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setSaving(true);
    await fetch("/api/career", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetCareer: target.trim() }),
    });
    setSaving(false);
    router.refresh();
    load();
  }

  if (!data) return <LoadingState label="Loading career..." />;

  if (!data.careerProfile) {
    return (
      <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <h1 className="text-2xl font-bold text-text mb-4">Career</h1>
        <Card>
          <p className="text-sm text-muted mb-3">What's your dream career? This drives your Learning and Opportunity recommendations everywhere in the app.</p>
          <form onSubmit={handleSetCareer} className="space-y-3">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. Registered Nurse, Software Engineer, Small Business Owner"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
            >
              {saving ? "Saving..." : "Set career target"}
            </button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        <img src={`https://picsum.photos/seed/${encodeURIComponent(data.careerProfile.targetCareer)}/900/400`} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Career</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{data.careerProfile.targetCareer}</h1>
        </div>
      </div>

      <Card className="animate-fadeInUp mb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-1">Career readiness</p>
        <ProgressBar percent={data.careerProfile.careerReadiness} />
        <p className="text-xs text-muted mt-1">{data.careerProfile.careerReadiness}% ready</p>
      </Card>

      <Card className="animate-fadeInUp">
        <p className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Skills</p>
        {data.skills.length === 0 ? (
          <p className="text-sm text-muted">No skills tracked yet. Ask your AI Manager which skills matter for this career.</p>
        ) : (
          <div className="space-y-3">
            {data.skills.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text">{s.skill.name}</span>
                  <span className="text-xs font-mono text-muted">{s.proficiency}%</span>
                </div>
                <ProgressBar percent={s.proficiency} color={s.proficiency < 50 ? "var(--brass)" : "var(--teal)"} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}