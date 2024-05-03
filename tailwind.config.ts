import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: ["app/**/*.{ts,tsx,jsx,js,html}"],
	theme: {
		fontFamily: {
			body: ["Mulish", "sans-serif"],
			display: ["Oxanium", "sans-serif"],
		},
		extend: {
			backgroundImage: {
				radial: "radial-gradient(169.40% 89.55% at 94.76% 6.29%, rgba(0, 0, 0, 0.40) 0%, rgba(255, 255, 255, 0.00) 100%)",
			},
			animation: {
				wiggle: "wiggle 1s ease-in-out infinite",
				breathe: "breathe 2.5s ease-in-out infinite",
			},
			keyframes: {
				wiggle: {
					"0%, 100%": { transform: "rotate(-3deg)" },
					"50%": { transform: "rotate(3deg)" },
				},
				breathe: {
					"0%, 100%": { transform: "scale(1.05) translateX(-50%)" },
					"45%": { transform: "scale(1) translateX(-50%)" },
				},
				breathe2: {
					"0%, 100%": { transform: "scale(1.02) translateX(-50%)" },
					"45%": { transform: "scale(1) translateX(-50%)" },
				},
			},
		},
	},
	plugins: [],
} satisfies Config;
