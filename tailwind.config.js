/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
    darkMode: ["class"],
    content: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        fontFamily: {
          'sans': ['Noto Sans', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', 'Noto Sans KR', ...defaultTheme.fontFamily.sans],
          'wiki': ['Linux Libertine O', ...defaultTheme.fontFamily.serif]
        },
        borderRadius: {
          lg: `var(--radius)`,
          md: `calc(var(--radius) - 2px)`,
          sm: "calc(var(--radius) - 4px)",
        },
        animation: {
          "fade-in": "fade-in 0.5s ease-out forwards",
          "slide-up": "slide-up 0.5s ease-out forwards",
          "spin": 'spin 60s linear infinite',
          "pulse": 'pulse 15s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          "fade-in": {
            "0%": {
              opacity: "0",
            },
            "100%": {
              opacity: "1",
            },
          },
          "slide-up": {
            "0%": {
              transform: "translateY(20px)",
              opacity: "0",
            },
            "100%": {
              transform: "translateY(0)",
              opacity: "1",
            },
          },
          spin: {
            '0%': { transform: 'rotate(0deg) scale(1)' },
            '25%': { transform: 'rotate(90deg) scale(0.5)' },
            '50%': { transform: 'rotate(180deg) scale(1)' },
            '75%': { transform: 'rotate(270deg) scale(0.5)' },
            '100%': { transform: 'rotate(360deg) scale(1)' },
          },
          pulse: {
            '0%, 100%': {
              opacity: 0.5,
            },
            '50%': {
              opacity: 0.75,
            }
          }
        },
        backgroundImage: {
          'grain': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')",
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }
  