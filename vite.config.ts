import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [enhancedImages(), sveltekit(), tailwindcss()],

	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
});
