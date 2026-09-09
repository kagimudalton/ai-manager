"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { ShieldCheck, ChevronRight } from "lucide-react";

type Group = { id: string; name: string; description: string | null; _count: { posts: number } };

export default function CommunityPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/community/groups");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setGroups(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error && !groups) return <ErrorState message={error} onRetry={load} />;
  if (!groups) return <LoadingState label="Loading groups..." />;

  return (
    <main className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      <div className="relative rounded-3xl overflow-hidden h-32 sm:h-40 mb-5 animate-fadeInUp">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://picsum.photos/seed/community-people/900/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)" }} />
        <div className="relative h-full flex flex-col justify-end p-5">
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest">Community</p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Find people learning the same things</h1>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState title="No groups yet" />
      ) : (
        <div className="space-y-3">
          {groups.map((g, i) => (
            <Link key={g.id} href={`/community/${g.id}`}>
              <Card className="animate-fadeInUp" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text">{g.name}</p>
                      <span
                        className="flex items-center gap-1 text-xs font-mono rounded-full px-1.5 py-0.5"
                        style={{ color: "var(--teal)", backgroundColor: "var(--teal-soft)" }}
                      >
                        <ShieldCheck size={10} /> Moderated
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{g._count.posts} posts</p>
                    {g.description && <p className="text-sm text-muted mt-2">{g.description}</p>}
                  </div>
                  <ChevronRight size={16} className="text-muted shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-muted mt-4 text-center">Your profile stays private by default in every group.</p>
    </main>
  );
}