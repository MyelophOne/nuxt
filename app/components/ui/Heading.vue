<template>
	<component :is="tag" :class="headingClass">
		<slot />
	</component>
</template>

<script setup lang="ts">
const props = defineProps<{
	level?: 1 | 2 | 3 | 4 | 5 | 6;
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

const headingClass = computed(() =>
	`${defaultClasses[props.level || 1]} ${props.class || ""}`.trim(),
);
</script>
