/**
 * @type {import("prettier").Config}
 */
export default {
	useTabs: true,
	tabWidth: 2,
	printWidth: 100,
	plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
	tailwindStylesheet: "./src/app.css",
	tailwindConfig: "./tailwind.config.ts",
	tailwindFunctions: ["cva", "cn", "clsx", "tv", "twMerge"],
	overrides: [
		{
			files: "*.svelte",
			options: {
				parser: "svelte",
			},
		},
	],
};
