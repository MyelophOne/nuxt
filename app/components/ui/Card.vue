<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		as?: "div" | "section" | "article";

		to?: string | object;
		href?: string;
		target?: string;

		bordered?: boolean;
		rounded?: boolean;
		padded?: boolean;
	}>(),
	{
		as: "div",
		bordered: true,
		rounded: true,
		padded: true,
	},
);

const isLink = computed(() => !!props.to || !!props.href);

const tag = computed(() => {
	if (props.to) return "NuxtLink";
	if (props.href) return "a";
	return props.as;
});

const classes = computed(() => [
	"bg-[var(--ui-bg)] text-[var(--ui-text)] transition",
	props.bordered ? "border border-[var(--ui-border,var(--ui-text))]" : "",
	props.rounded ? "rounded-lg" : "rounded-none",
	isLink.value
		? "cursor-pointer hover:bg-[color-mix(in srgb, var(--ui-bg) 92%, var(--ui-text))] focus:outline-none focus:ring-2 focus:ring-[var(--ui-border,var(--ui-text))] focus:ring-offset-2"
		: "",
]);
</script>

<template>
	<component
		:is="tag"
		:to="to"
		:href="href"
		:target="target"
		:class="classes"
	>
		<div
			v-if="$slots.header"
			class="px-4 py-3 border-b border-(--ui-border,var(--ui-text))"
		>
			<slot name="header" />
		</div>

		<div :class="padded ? 'p-4' : ''">
			<slot />
		</div>

		<div
			v-if="$slots.footer"
			class="px-4 py-3 border-t border-(--ui-border,var(--ui-text))"
		>
			<slot name="footer" />
		</div>
	</component>
</template>
