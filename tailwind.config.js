/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          bg: "#000000",
          surface: "#090117",
          duke: "#1C0248",
          dukeLight: "#2E066E",
          dukeCard: "rgba(28, 2, 72, 0.85)",
          card: "rgba(18, 5, 38, 0.90)",
          cardHover: "rgba(36, 10, 72, 0.95)",
          border: "rgba(75, 20, 140, 0.65)",
          borderOrange: "rgba(255, 91, 0, 0.55)",
          orange: "#FF5B00",
          orangeBright: "#FF751A",
          orangeGlow: "rgba(255, 91, 0, 0.45)",
          cyan: "#00D2FF",
          crimson: "#FF1E56",
          amber: "#FFB800",
          muted: "#A5A6C2",
          darkMuted: "#14072B",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Space Grotesk", "Syne", "Inter", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        widest: "0.18em",
        ultra: "0.28em",
      },
      boxShadow: {
        "orbit-card": "0 10px 36px 0 rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 91, 0, 0.1)",
        "orange-glow": "0 0 24px rgba(255, 91, 0, 0.45)",
        "duke-glow": "0 0 30px rgba(28, 2, 72, 0.75)",
        "crimson-glow": "0 0 24px rgba(255, 30, 86, 0.5)",
      },
      animation: {
        "orange-pulse": "orangePulse 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        orangePulse: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "70%": { transform: "scale(1.3)", opacity: "0" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
