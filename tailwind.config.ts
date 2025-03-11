import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        customPink: '#FF5E6C',
        darkGray: '#2E2E2E',
        lightBlue: '#03A9F4',
        orange:'#FF5722',
        lightGray: '#E0E0E0',
        nightBlack:'#1C1C1C',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'mic-pulse': 'micRecordingAnimation 0.5s ease-in-out infinite',
      },
      keyframes: {
        micRecordingAnimation: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
