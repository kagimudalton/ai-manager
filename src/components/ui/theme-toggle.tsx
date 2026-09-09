"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark" | null) ?? "light";
    setTheme(saved);
    document.documentElement.className = `theme-${saved}`;
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.className = `theme-${next}`;
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full border flex items-center justify-center transition-transform active:scale-90"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <Moon size={15} style={{ color: "var(--accent)" }} /> : <Sun size={15} style={{ color: "var(--brass)" }} />}
    </button>
  );
}
