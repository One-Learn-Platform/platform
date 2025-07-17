<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive:
					"border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/70 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
				destructive_muted:
					"border-destructive bg-destructive-muted text-destructive focus-visible:ring-destructive-muted/20 dark:bg-destructive-muted/70 dark:focus-visible:ring-destructive-muted/40 [a&]:hover:bg-destructive-muted/90",
				informative:
					"border-transparent bg-informative text-white focus-visible:ring-informative/20 dark:bg-informative/70 dark:focus-visible:ring-informative/40 [a&]:hover:bg-informative/90",
				informative_muted:
					"border-transparent bg-informative-muted text-informative focus-visible:ring-informative-muted/20 dark:bg-informative-muted/70 dark:focus-visible:ring-informative-muted/40 [a&]:hover:bg-informative-muted/90",
				success:
					"border-transparent bg-success text-white focus-visible:ring-success/20 dark:bg-success/70 dark:focus-visible:ring-success/40 [a&]:hover:bg-success/90",
				success_muted:
					"border-success bg-success-muted text-success focus-visible:ring-success-muted/20 dark:bg-success-muted/70 dark:focus-visible:ring-success-muted/40 [a&]:hover:bg-success-muted/90",
				warning:
					"border-transparent bg-warning text-white focus-visible:ring-warning/20 dark:bg-warning/70 dark:focus-visible:ring-warning/40 [a&]:hover:bg-warning/90",
				interactive:
					"border-transparent bg-interactive text-white focus-visible:ring-interactive/20 dark:bg-interactive/70 dark:focus-visible:ring-interactive/40 [a&]:hover:bg-interactive/90",
				interactive_muted:
					"border-transparent bg-interactive-muted text-interactive focus-visible:ring-interactive-muted/20 dark:bg-interactive-muted/70 dark:focus-visible:ring-interactive-muted/40 [a&]:hover:bg-interactive-muted/90",
				laboratory:
					"border-transparent bg-informative text-white focus-visible:ring-informative/20 dark:bg-informative/70 dark:focus-visible:ring-informative/40 [a&]:hover:bg-informative/90",
				lesson:
					"border-transparent bg-success text-white focus-visible:ring-success/20 dark:bg-success/70 dark:focus-visible:ring-success/40 [a&]:hover:bg-success/90",
				practicum:
					"border-transparent bg-interactive text-white focus-visible:ring-interactive/20 dark:bg-interactive/70 dark:focus-visible:ring-interactive/40 [a&]:hover:bg-interactive/90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
