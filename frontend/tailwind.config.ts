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
      },
      colors: {     
        mainLight:  "var(--color-mainLight)",
        mainPrimary: "var(--color-mainPrimary)",
        mainDark: "var(--color-mainDark)", 
        mainHighlight: "var(--color-mainhighlight)", 
        mainGray: "var(--color-mainGray)",
        mainBg: "var(--color-mainBg)", 
        mainLightGray: "var(--color-mainLightGray)",
        positve: "var(--color-positve)", 
        negative:"var(--color-negative)", 
        decision:"var(--color-decision)", 
         

      },
    },
  },
  plugins: [],
};

export default config;
