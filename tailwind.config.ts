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
          primary: "#d946ef",
          "base-100": "#262626",
        },
      },
      // "dark",
    ],
  },
  plugins: [require("daisyui")],
} satisfies Config;
