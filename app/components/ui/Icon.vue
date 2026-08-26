<template>
	<span
		class="app-icon shadow-none"
		:class="[props.class, !normalizedSize ? 'w-5 h-5' : '']"
		:style="{
			'--icon-url': `url(${iconUrl})`,
			width: normalizedSize || undefined,
			height: normalizedSize || undefined,
		}"
		role="img"
	/>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";

interface Props {
	name: string;
	size?: string | number;
	class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();

const [prefix, iconName] = props.name.split(":");

const iconUrl = computed(
	() => `https://api.iconify.design/${prefix}/${iconName}.svg`,
);

const normalizedSize = computed(() => {
	if (!props.size) return null;

	const s = String(props.size);

	if (/^\d+$/.test(s)) return `${s}px`;

	if (/^\d+(\.\d+)?(px|rem|em|vh|vw|%|pt|pc|in|cm|mm)$/.test(s)) return s;

	return s;
});
</script>
