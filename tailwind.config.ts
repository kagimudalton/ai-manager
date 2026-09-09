import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        brass: "var(--brass)",
        teal: "var(--teal)",
        danger: "var(--danger)",
        ink: "var(--ink)",
      },
    },
  },
  plugins: [],
};

export default config;
