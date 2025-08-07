<script lang="ts">
	import type { Snippet } from "svelte";
	import { buttonVariants, Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { resetMode, setMode, userPrefersMode } from "mode-watcher";

	import Contrast from "@lucide/svelte/icons/contrast";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SunIcon from "@lucide/svelte/icons/sun";
	import { siGithub } from "simple-icons";

	import Logo from "$lib/assets/logo.svg";
	import LogoDark from "$lib/assets/logo_dark.svg";

	let { children }: { children: Snippet } = $props();
</script>

<nav
	class="fixed top-0 left-0 flex w-full items-center justify-between bg-background/80 px-4 py-2 antialiased backdrop-blur-md sm:px-8"
>
	<a href="/" aria-label="Home">
		<img src={Logo} alt="" class="h-6 w-auto dark:hidden" />
		<img src={LogoDark} alt="" class=" hidden h-6 w-auto dark:block" />
	</a>
	<div class="flex items-center gap-2">
		<Button href="/signin" size="sm" variant="outline" class="">Sign In</Button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={buttonVariants({
					variant: "outline",
					size: "icon",
					className: "size-8 ",
				})}
			>
				<MoonIcon
					class={[
						"absolute h-[1.2rem] w-[1.2rem] transition-all",
						userPrefersMode.current === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90",
					]}
				/>
				<SunIcon
					class={[
						" absolute h-[1.2rem] w-[1.2rem] transition-all",
						userPrefersMode.current === "light" ? "scale-100 rotate-0" : "scale-0 rotate-90",
					]}
				/>
				<Contrast
					class={[
						"absolute h-[1.2rem] w-[1.2rem] transition-all",
						userPrefersMode.current === "system" ? "scale-100 rotate-0" : "scale-0 rotate-90",
					]}
				/>

				<span class="sr-only">Toggle theme</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item
					onclick={() => setMode("light")}
					class={userPrefersMode.current === "light"
						? "font-semibold [&_svg:not([class*='text-'])]:text-foreground"
						: ""}><SunIcon />Light</DropdownMenu.Item
				>
				<DropdownMenu.Item
					onclick={() => setMode("dark")}
					class={userPrefersMode.current === "dark"
						? "font-semibold [&_svg:not([class*='text-'])]:text-foreground"
						: ""}><MoonIcon />Dark</DropdownMenu.Item
				>
				<DropdownMenu.Item
					onclick={() => resetMode()}
					class={userPrefersMode.current === "system"
						? "font-semibold [&_svg:not([class*='text-'])]:text-foreground"
						: ""}><Contrast />System</DropdownMenu.Item
				>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</nav>
{@render children()}
<footer class="flex flex-col justify-center px-4 py-12 antialiased sm:px-8">
	<div class="flex flex-col items-center justify-between gap-8 sm:flex-row sm:gap-2">
		<div class="flex flex-col items-center justify-start gap-1 sm:flex-row sm:gap-4">
			<img src={Logo} alt="" class="h-6 w-auto dark:hidden" />
			<img src={LogoDark} alt="" class=" hidden h-6 w-auto dark:block" />
			<p class="text-center text-sm tracking-tight sm:text-left">
				&copy; 2025 by Rafli Malik, Benny Chandra Setiawan, Andreas Dwi Indrawan, licensed under <a
					href="https://creativecommons.org/licenses/by/4.0/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 hover:underline dark:text-blue-400"
				>
					Creative Commons Attribution 4.0 International
				</a>
			</p>
		</div>
		<div class="flex flex-row items-center justify-start gap-4 text-sm">
			<a
				href="/about"
				class="transition duration-150 ease-out hover:text-orange-600 hover:underline dark:hover:text-orange-400"
			>
				About
			</a>
			<a
				href="/disclaimer"
				class="transition duration-150 ease-out hover:text-orange-600 hover:underline dark:hover:text-orange-400"
			>
				Disclaimer
			</a>
			<a
				href="https://github.com/One-Learn-Platform/platform"
				class="flex flex-row items-center gap-1 transition duration-150 ease-out hover:text-orange-600 hover:underline dark:hover:text-orange-400"
			>
				<div class="size-4 dark:fill-white">
					{@html siGithub.svg}
				</div>
				Github
			</a>
		</div>
	</div>
</footer>
