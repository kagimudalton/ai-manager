"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { Heart, MoreHorizontal, Flag, Ban, Info, Send } from "lucide-react";

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  reactions: { userId: string }[];
};
type Group = { id: string; name: string; posts: Post[] };

export default function CommunityGroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await fetch(`/api/community/groups/${groupId}`);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setGroup(data.group);
      setCurrentUserId(data.currentUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group");
    }
  }

  useEffect(() => {
    load();
  }, [groupId]);

  async function submitPost() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/community/groups/${groupId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGroup((g) => (g ? { ...g, posts: [data.post, ...g.posts] } : g));
        setDraft("");
      }
    } finally {
      setPosting(false);
    }
  }

  async function toggleReact(postId: string) {
    setGroup((g) => {
      if (!g) return g;
      return {
        ...g,
        posts: g.posts.map((p) => {
          if (p.id !== postId) return p;
          const liked = p.reactions.some((r) => r.userId === currentUserId);
          return {
            ...p,
            reactions: liked ? p.reactions.filter((r) => r.userId !== currentUserId) : [...p.reactions, { userId: currentUserId }],
          };
        }),
      };
    });
    await fetch(`/api/community/posts/${postId}/react`, { method: "POST" });
  }

  async function report(postId: string) {
    setReportedIds((ids) => [...ids, postId]);
    setOpenMenuId(null);
    await fetch(`/api/community/posts/${postId}/report`, { method: "POST" });
  }

  async function block(authorId: string) {
    setOpenMenuId(null);
    setGroup((g) => (g ? { ...g, posts: g.posts.filter((p) => p.author.id !== authorId) } : g));
    await fetch("/api/community/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedUserId: authorId }),
    });
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!group) return <LoadingState label="Loading..." />;

  return (
    <main className="max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 pt-6 pb-24 space-y-3">
      <h1 className="text-xl font-bold text-text mb-2">{group.name}</h1>

      <div className="rounded-2xl p-3.5 border flex items-start gap-2.5 mb-1" style={{ backgroundColor: "var(--accent-soft)", borderColor: "var(--border)" }}>
        <Info size={15} style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed text-text">
          Be kind, keep it on-topic, and never share anyone's personal contact details.
        </p>
      </div>

      <Card>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Share something with ${group.name}...`}
          rows={3}
          className="w-full text-sm rounded-xl border px-3 py-2.5 outline-none resize-none mb-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
        />
        <button
          onClick={submitPost}
          disabled={posting || !draft.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
        >
          <Send size={14} /> {posting ? "Posting..." : "Post"}
        </button>
      </Card>

      {group.posts.length === 0 && <p className="text-sm text-muted text-center py-8">No posts yet - be the first.</p>}

      {group.posts.map((post) => {
        const liked = post.reactions.some((r) => r.userId === currentUserId);
        const menuOpen = openMenuId === post.id;
        const reported = reportedIds.includes(post.id);
        return (
          <Card key={post.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}>
                  {post.author.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{post.author.name}</p>
                  <p className="text-xs text-muted">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => setOpenMenuId(menuOpen ? null : post.id)}>
                <MoreHorizontal size={16} className="text-muted" />
              </button>
            </div>

            <p className="text-sm mt-3 text-text">{post.content}</p>

            <button onClick={() => toggleReact(post.id)} className="flex items-center gap-1.5 text-xs mt-3" style={{ color: liked ? "var(--danger)" : "var(--muted)" }}>
              <Heart size={15} style={liked ? { fill: "var(--danger)" } : {}} /> {post.reactions.length}
            </button>

            {menuOpen && (
              <div className="flex gap-2 border-t pt-3 mt-3" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => report(post.id)} disabled={reported} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border rounded-lg py-2 disabled:opacity-50" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                  <Flag size={13} /> {reported ? "Reported" : "Report post"}
                </button>
                <button onClick={() => block(post.author.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border rounded-lg py-2" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                  <Ban size={13} /> Block {post.author.name}
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </main>
  );
}