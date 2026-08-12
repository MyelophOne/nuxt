<template>
	<div
		ref="stickyRef"
		class="relative w-full lg:sticky z-10"
		:style="{ top: `${offset}px` }"
	>
		<div
			class="w-full overflow-y-auto scrollbar-none"
			:style="{ maxHeight: `calc(100vh - ${offset + 20}px)` }"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	offset: {
		type: Number,
		default: 100,
	},
});

const stickyRef = ref<HTMLElement | null>(null);

onMounted(() => {
	const parent = stickyRef.value?.parentElement;

	if (parent) {
		parent.style.height = "100%";
		if (getComputedStyle(parent).position === "static") {
			parent.style.position = "relative";
		}
	}
});
</script>

<style scoped>
.scrollbar-none {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
	display: none;
}
</style>
