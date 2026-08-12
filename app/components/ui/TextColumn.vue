<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		textSizeClass?: string;
		textColorClass?: string;
		spacingClass?: string;
	}>(),
	{
		textSizeClass: "text-lg leading-relaxed",
		textColorClass: "text-gray-700 dark:text-gray-300",
		spacingClass: "space-y-4 sm:space-y-6",
	},
);
</script>

<template>
	<div
		class="text-column w-full lg:w-[70%] xl:w-[65%]"
		:class="[textSizeClass, textColorClass, spacingClass]"
	>
		<slot />
	</div>
</template>

<style scoped>
.text-column :deep(p) {
	font-size: inherit;
	color: inherit;
}

.text-column :deep(ul),
.text-column :deep(ol) {
	font-size: inherit;
	color: inherit;
}
</style>
