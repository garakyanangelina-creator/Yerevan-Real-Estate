import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F2A4A",
          50: "#EEF3F8",
          100: "#D7E3EF",
          200: "#AFC7DF",
          300: "#87ABCF",
          400: "#5F8FBF",
          500: "#3773AF",
          600: "#1C5491",
          700: "#143E6E",
          800: "#0F2A4A",
          900: "#091B30",
        },
        gold: {
          DEFAULT: "#C9A24B",
          50: "#FBF6EA",
          100: "#F3E6C2",
          200: "#E8D29A",
          300: "#DDBE72",
          400: "#D3AC59",
          500: "#C9A24B",
          600: "#A9842F",
          700: "#856626",
          800: "#61481B",
          900: "#3D2D11",
        },
        surface: "#F7F8FA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(15, 42, 74, 0.15)",
        glass: "0 8px 32px 0 rgba(15, 42, 74, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
