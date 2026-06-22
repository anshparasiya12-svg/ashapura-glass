import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT:    "hsl(var(--sidebar-bg))",
          foreground: "hsl(var(--sidebar-fg))",
          hover:      "hsl(var(--sidebar-hover))",
          active:     "hsl(var(--sidebar-active))",
          border:     "hsl(var(--sidebar-border))",
        },
        stat: {
          blue:   "hsl(var(--stat-blue))",
          orange: "hsl(var(--stat-orange))",
          green:  "hsl(var(--stat-green))",
          teal:   "hsl(var(--stat-teal))",
        },
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        "card":    "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.06)",
        "card-lg": "0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 12px -4px rgba(0,0,0,0.08)",
        "glow":    "0 0 20px rgba(20,184,166,0.25)",
        "glow-lg": "0 0 40px rgba(20,184,166,0.3)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in-up":     { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in":        { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-left":  { from: { opacity: "0", transform: "translateX(-20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "float":          { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        "pulse-glow":     { "0%,100%": { boxShadow: "0 0 0 0 rgba(20,184,166,0.3)" }, "50%": { boxShadow: "0 0 0 8px rgba(20,184,166,0)" } },
        "blob":           { "0%,100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }, "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" } },
        "shimmer":        { "0%": { backgroundPosition: "-200% center" }, "100%": { backgroundPosition: "200% center" } },
        "count-up":       { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in-up":      "fade-in-up 0.5s ease-out both",
        "fade-in":         "fade-in 0.4s ease-out both",
        "slide-in-left":   "slide-in-left 0.4s ease-out both",
        "float":           "float 6s ease-in-out infinite",
        "pulse-glow":      "pulse-glow 2s ease-in-out infinite",
        "blob":            "blob 8s ease-in-out infinite",
        "shimmer":         "shimmer 1.5s linear infinite",
        "count-up":        "count-up 0.6s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
