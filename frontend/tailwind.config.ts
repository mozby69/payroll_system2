import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        payroll: ["var(--font-payrollFont)"],
      },
      fontSize: {
        body: "var(--body-fs)",
        heading: "var(--heading-fs)",
        subheading: "var(--subheading-fs)",
        caption: "var(--caption-fs)",
        display: "var(--display-fs)",
      },
      colors: {     
        mainLight:  "var(--color-mainLight)",
        mainDark: "var(--color-mainDark)", 
        mainNeutral: "var(--color-mainNeutral)",
        mainGrey: "var(--color-mainGrey)",
        mainTest: "var(--color-mainTest)",

      },
    },
  },
  plugins: [],
};

export default config;
