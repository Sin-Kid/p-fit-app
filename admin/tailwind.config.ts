import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: {
          DEFAULT: "#00E676",
          foreground: "#000000",
        },
        accent: {
          cyan: "#00E5FF",
          orange: "#FF6D00",
          purple: "#8957E5",
          red: "#EF4444",
        },
        status: {
          online: "#10B981",
          warning: "#F59E0B",
          critical: "#EF4444",
          offline: "#6B7280",
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
