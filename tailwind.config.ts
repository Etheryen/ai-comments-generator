import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#c026d3",
          "base-100": "#262626",
        },
      },
      // "dark",
    ],
  },
  plugins: [require("daisyui")],
} satisfies Config;
