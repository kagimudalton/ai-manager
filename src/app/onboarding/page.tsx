"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("amara@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (result?.error) {
      setError("Couldn't sign in - check the email and password.");
      return;
    }
    router.push("/home");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AmbientBackground />

      <div className="w-full max-w-sm animate-fadeInUp">
        <div className="relative rounded-3xl overflow-hidden h-40 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://picsum.photos/seed/welcome-journey/700/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)" }} />
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} style={{ color: "var(--brass)" }} />
              <span className="text-white/70 text-xs font-mono uppercase tracking-widest">Personalized AI Manager</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          </div>
        </div>

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-sm text-muted mb-5">
            Pre-filled with the seeded demo account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:ring-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-medium disabled:opacity-50 transition-transform active:scale-95"
              style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}