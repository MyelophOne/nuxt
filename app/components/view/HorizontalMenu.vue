<template>
	<div class="relative w-full" :style="maskStyle">
		<div
			ref="scrollContainer"
			@wheel.prevent="handleWheel"
			@scroll="updateScrollState"
			class="flex items-center overflow-x-auto gap-x-2 lg:gap-x-4 scrollbar-none [&::-webkit-scrollbar]:hidden"
		>
			<NuxtLink
				v-for="item in items"
				:key="item.path"
				:to="item.path"
				class="py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap"
				active-class="bg-gray-200 dark:bg-gray-700 !text-gray-900 dark:!text-white font-semibold"
			>
				{{ item.label }}
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps({
	items: {
		type: Array as () => { label: string; path: string }[],
		required: true,
		default: () => [],
	},
});

const scrollContainer = ref<HTMLElement | null>(null);
const handleWheel = (event: WheelEvent) => {
	if (scrollContainer.value) {
		scrollContainer.value.scrollLeft += event.deltaY;
	}
};

const hasOverflow = ref(false);
const isScrolledToStart = ref(true);
const isScrolledToEnd = ref(false);

const updateScrollState = () => {
	const el = scrollContainer.value;
	if (!el) return;

	const overflow = el.scrollWidth > el.clientWidth;
	hasOverflow.value = overflow;

	if (overflow) {
		isScrolledToStart.value = el.scrollLeft < 1;
		isScrolledToEnd.value =
			Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 1;
	} else {
		isScrolledToStart.value = true;
		isScrolledToEnd.value = true;
	}
};

const maskStyle = computed(() => {
	if (!hasOverflow.value) {
		return {};
	}

	const fadeWidth = "2rem";
	let gradient: string;

	if (isScrolledToStart.value) {
		gradient = `linear-gradient(to right, black calc(100% - ${fadeWidth}), transparent)`;
	} else if (isScrolledToEnd.value) {
		gradient = `linear-gradient(to left, black calc(100% - ${fadeWidth}), transparent)`;
	} else {
		gradient = `linear-gradient(to right, transparent, black ${fadeWidth}, black calc(100% - ${fadeWidth}), transparent)`;
	}

	return {
		"mask-image": gradient,
		"-webkit-mask-image": gradient,
	};
});

onMounted(() => {
	nextTick(() => {
		updateScrollState();
		window.addEventListener("resize", updateScrollState);
	});
});

onUnmounted(() => {
	window.removeEventListener("resize", updateScrollState);
});
</script>

<style scoped>
div {
	scrollbar-width: none;
}
</style>
