import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        // "./src/common/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                customButtonColor: "#1EB49F",
                customFooterBackgroundColor: "#F5F5F5",
                tagColor: "#929292",
                customGray: "#333",
                manageBgColor: "#F3F5F7",
            },
            cursor: {
                "nwse-resize": "nwse-resize", // 커서 추가
            },
            animation: {
                progressBar: "progressBar 2s ease-in-out infinite",
            },
            keyframes: {
                progressBar: {
                    "0%": { transform: "scaleX(0)" },
                    "50%": { transform: "scaleX(0.5)" },
                    "100%": { transform: "scaleX(1)" },
                },
            },
        },
    },
    variants: {
        extend: {
            textColor: ["hover"],
        },
    },
    plugins: [],
};
export default config;
