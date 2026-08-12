<script setup lang="ts">
const { scrollToTop } = useSnapScroll();
const scrollY = ref(0);

const handleScroll = () => {
	scrollY.value = window.scrollY;
};

const isVisible = computed(() => {
	return scrollY.value > 600;
});

onMounted(() => {
	window.addEventListener("scroll", handleScroll, { passive: true });
	handleScroll();
});

onUnmounted(() => {
	window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
	<Teleport to="body">
		<Transition name="fade-up">
			<button
				v-if="isVisible"
				@click="scrollToTop"
				type="button"
				class="fixed bottom-8 right-8 z-100 p-4 rounded-full bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-transform active:scale-90"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m18 15-6-6-6 6" />
				</svg>
			</button>
		</Transition>
	</Teleport>
</template>
