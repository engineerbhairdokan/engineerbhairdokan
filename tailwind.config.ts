import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2433",
          800: "#242F42",
          700: "#374357",
        },
        gold: {
          DEFAULT: "#F3A93B",
          600: "#E0941F",
          100: "#FCEBCB",
        },
        wood: {
          DEFAULT: "#9C6A34",
          700: "#7A5127",
        },
        cream: "#F7F1E4",
      },
      fontFamily: {
        display: ["var(--font-baloo)", "system-ui", "sans-serif"],
        body: ["var(--font-worksans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plexmono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
