<template>
	<component :is="tag" :class="headingClass">
		<slot />
	</component>
</template>

<script setup lang="ts">
const props = defineProps<{
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "display";
	class?: string;
}>();

const tag = computed(() => `h${props.level || 2}`);

const defaultClasses: Record<number, string> = {
	1: "text-4xl font-semibold",
	2: "text-3xl font-semibold",
	3: "text-2xl font-semibold",
	4: "text-xl font-medium",
	5: "text-lg font-medium",
	6: "text-base font-normal",
};

const fontWeightClasses: Record<number, string> = {
	1: "font-semibold",
	2: "font-semibold",
	3: "font-semibold",
	4: "font-medium",
	5: "font-medium",
	6: "font-normal",
};

const sizeClasses = {
	xs: "text-xl",
	sm: "text-2xl",
	md: "text-3xl",
	lg: "text-4xl md:text-5xl",
	xl: "text-5xl md:text-6xl",
	display: "text-5xl md:text-7xl lg:text-8xl",
} as const;

const headingClass = computed(() => {
	const level = props.level || 1;
	const typography = props.size
		? `${sizeClasses[props.size]} ${fontWeightClasses[level]}`
		: defaultClasses[level];

	return `${typography} ${props.class || ""}`.trim();
});
</script>
