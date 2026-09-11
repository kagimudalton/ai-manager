"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function BootstrapButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/onboarding/bootstrap", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-medium text-sm disabled:opacity-60"
      style={{ backgroundColor: "var(--accent)", color: "var(--ink-text)" }}
    >
      <Sparkles size={15} />
      {loading ? "Setting up your dashboard (takes ~10 seconds)..." : "Set up my dashboard"}
    </button>
  );
}