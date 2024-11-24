import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "nyt-yellow": "#F9DCBE",
        "nyt-green": "#C9CBD2",
        "nyt-blue": "#232D4B",
        "nyt-purple": "#E57200",
        "nyt-lilac": "#B1A7F8",
        "nyt-light": "#EFEFE6",
        "nyt-dark": "#5A594E",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
