<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
				secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
				destructive:
					"bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
				outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
				ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
				link: "text-primary underline-offset-4 hover:underline",
				informative:
					"bg-informative text-white focus-visible:ring-informative/20 dark:bg-informative/70 dark:focus-visible:ring-informative/40 [a]:hover:bg-informative/90",
				success:
					"bg-success text-white focus-visible:ring-success/20 dark:bg-success/70 dark:focus-visible:ring-success/40 [a]:hover:bg-success/90",
				warning:
					"bg-warning text-white focus-visible:ring-warning/20 dark:bg-warning/70 dark:focus-visible:ring-warning/40 [a]:hover:bg-warning/90",
				interactive:
					"bg-interactive text-white focus-visible:ring-interactive/20 dark:bg-interactive/70 dark:focus-visible:ring-interactive/40 [a]:hover:bg-interactive/90",
			},
			fill: {
				default: "",
				muted: "",
			},
		},
		compoundVariants: [
			{
				variant: "destructive",
				fill: "muted",
				class:
					"border-destructive bg-destructive-muted text-destructive focus-visible:ring-destructive-muted/20 dark:bg-destructive-muted/70 dark:focus-visible:ring-destructive-muted/40 [a]:hover:bg-destructive-muted/90",
			},
			{
				variant: "informative",
				fill: "muted",
				class:
					"bg-informative-muted text-informative focus-visible:ring-informative-muted/20 dark:bg-informative-muted/70 dark:focus-visible:ring-informative-muted/40 [a]:hover:bg-informative-muted/90",
			},
			{
				variant: "success",
				fill: "muted",
				class:
					"border-success bg-success-muted text-success focus-visible:ring-success-muted/20 dark:bg-success-muted/70 dark:focus-visible:ring-success-muted/40 [a]:hover:bg-success-muted/90",
			},
			{
				variant: "warning",
				fill: "muted",
				class:
					"bg-warning-muted text-warning focus-visible:ring-warning-muted/20 dark:bg-warning-muted/70 dark:focus-visible:ring-warning-muted/40 [a]:hover:bg-warning-muted/90",
			},
			{
				variant: "interactive",
				fill: "muted",
				class:
					"bg-interactive-muted text-interactive focus-visible:ring-interactive-muted/20 dark:bg-interactive-muted/70 dark:focus-visible:ring-interactive-muted/40 [a]:hover:bg-interactive-muted/90",
			},
		],
		defaultVariants: {
			variant: "default",
			fill: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
	export type BadgeFill = VariantProps<typeof badgeVariants>["fill"];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		fill = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
		fill?: BadgeFill;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant, fill }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
