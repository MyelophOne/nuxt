<template>
	<span v-if="false" aria-hidden="true" />
</template>

<script setup lang="ts">
const props = defineProps<{
	statusCode?: number;
}>();

const is4xx = computed(
	() =>
		props.statusCode !== undefined &&
		props.statusCode >= 400 &&
		props.statusCode < 500,
);

if (is4xx.value) {
	useSeoMeta({
		robots: "noindex, nofollow",
	});
}
</script>
