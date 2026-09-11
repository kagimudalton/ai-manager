"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Sparkles, Check, Plus } from "lucide-react";

const AVAILABLE_INTERESTS = [
  "Machine Learning", "Painting", "Language learning", "Entrepreneurship",
  "Nursing & Healthcare", "Writing", "Music", "Fitness", "Cooking & Baking",
  "Photography", "Public speaking", "Personal finance",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "interests">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("amara@example.com");
  const [password, setPassword] = useState("password123");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create account");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (result?.error) {
        setError("Account created, but sign-in failed - try signing in manually.");
        return;
      }
      setMode("interests");
    } catch {
      setLoading(false);
      setError("Something went wrong - please try again.");
    }
  }

  function toggleInterest(interest: string) {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  }

  function addCustomInterest() {
    const trimmed = customInterest.trim();
    if (!trimmed) return;
    if (!interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
    }
    setCustomInterest("");
  }

  async function handleSaveInterests() {
    setLoading(true);
    try {
      await fetch("/api/profile/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: interests.length > 0 ? interests : ["General learning"] }),
      });
    } finally {
      router.push("/home");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <AmbientBackground />

      <div className="w-full max-w-sm animate-fadeInUp">
        <div className="relative rounded-3xl overflow-hidden h-40 mb-6">
          <img src="https://picsum.photos/seed/welcome-journey/700/400" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)" }} />
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} style={{ color: "var(--brass)" }} />
              <span className="text-white/70 text-xs font-mono uppercase tracking-widest">Personalized AI Manager</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === "interests" ? "What are you into?" : "Welcome"}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          {mode === "interests" ? (
            <div>
              <p className="text-sm text-muted mb-4">Pick a few, or add your own - this shapes what your AI Manager recommends.</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-2 border transition-colors"
                      style={
                        selected
                          ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "var(--ink-text)" }
                          : { backgroundColor: "var(--surface-alt)", borderColor: "var(--border)", color: "var(--text)" }
                      }
                    >
                      {selected && <Check size={12} />}
                      {interest}
                    </button>
                  );
                })}
                {interests.filter((i) => !AVAILABLE_INTERESTS.includes(i)).map((custom) => (
                  <button
                    key={custom}
                    onClick={() => toggleInterest(custom)}
                    className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-2 border"
                    style={{ backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "var(--ink-text)" }}
                  >
                    <Check size={12} />
                    {custom}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-5">
                <input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); } }}
                  placeholder="Or type your own..."
                  className="flex-1 text-sm rounded-xl border px-3 py-2 outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
                />
                <button
                  onClick={addCustomInterest}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleSaveInterests}
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
              >
                {loading ? "Setting up your dashboard..." : "Continue"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => { setMode("signin"); setError(null); }}
                  className="flex-1 text-sm font-medium py-2 rounded-lg"
                  style={mode === "signin" ? { backgroundColor: "var(--accent)", color: "var(--ink-text)" } : { color: "var(--muted)" }}
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setMode("signup"); setError(null); }}
                  className="flex-1 text-sm font-medium py-2 rounded-lg"
                  style={mode === "signup" ? { backgroundColor: "var(--accent)", color: "var(--ink-text)" } : { color: "var(--muted)" }}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={mode === "signup" ? handleRegister : handleSignIn} className="space-y-3">
                {mode === "signup" && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-alt)", color: "var(--text)" }}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
                >
                  {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}