import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf6ec",
          100: "#faebd2",
          200: "#f2d3a1",
          300: "#e8b467",
          400: "#dd9739",
          500: "#c97f22",
          600: "#a8631b",
          700: "#7f4a19",
          800: "#5c3618",
          900: "#3a2412",
          950: "#1f1209",
        },
        ink: {
          950: "#0b0c0e",
          900: "#111318",
          800: "#181b21",
          700: "#22262e",
        },
      },
      fontFamily: {
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(201,127,34,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
