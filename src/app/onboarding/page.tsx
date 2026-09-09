"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
      setError("Couldn't sign in — check the email and password.");
      return;
    }
    router.push("/home");
  }

  return (
    <main className="max-w-sm mx-auto px-4 pt-20">
      <h1 className="text-2xl font-bold text-text mb-1">Sign in</h1>
      <p className="text-sm text-muted mb-6">
        Pre-filled with the seeded demo account (run <code>npm run db:seed</code> first).
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--ink)", color: "var(--ink-text)" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
