<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		errorClasses,
		children: childrenProp,
		...restProps
	}: WithoutChild<FormPrimitive.FieldErrorsProps> & {
		errorClasses?: string | undefined | null;
	} = $props();
</script>

<FormPrimitive.FieldErrors
	bind:ref
	class={cn("text-sm font-medium text-destructive", className)}
	{...restProps}
>
	{#snippet children({ errors, errorProps })}
		{#if childrenProp}
			{@render childrenProp({ errors, errorProps })}
		{:else}
			{#each errors as error (error)}
				<div {...errorProps} class={cn("flex items-center gap-1 pl-px text-xs", errorClasses)}>
					<TriangleAlert class="size-4" strokeWidth={1.5} />{error}
				</div>
			{/each}
		{/if}
	{/snippet}
</FormPrimitive.FieldErrors>
