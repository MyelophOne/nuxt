<script setup lang="ts">
interface Review {
	text: string;
	name?: string;
	city?: string;
	avatar?: string;
	link?: string;
}

const props = defineProps<{ items: Review[] }>();

const currentIndex = ref(0);
const isPaused = ref(false);
const isDragging = ref(false);
const isMounted = ref(false);
const startX = ref(0);
const dragOffset = ref(0);
const visibleCount = ref(4);
const desktopVisible = 4;

const maxIndex = computed(() =>
	Math.max(0, props.items.length - visibleCount.value),
);

const updateVisibleCount = () => {
	if (typeof window !== "undefined") {
		visibleCount.value = window.innerWidth < 768 ? 1 : desktopVisible;

		if (currentIndex.value > maxIndex.value)
			currentIndex.value = maxIndex.value;
	}
};

const moveNextAuto = () =>
	currentIndex.value >= maxIndex.value
		? (currentIndex.value = 0)
		: currentIndex.value++;

const moveNextManual = () => {
	if (currentIndex.value < maxIndex.value) currentIndex.value++;
};

const movePrevManual = () => {
	if (currentIndex.value > 0) currentIndex.value--;
};

const getClientX = (e: MouseEvent | TouchEvent): number => {
	if ("touches" in e) {
		return e.touches[0]?.clientX ?? 0;
	}
	return e.clientX;
};

const onStart = (e: MouseEvent | TouchEvent) => {
	isPaused.value = true;
	isDragging.value = true;
	startX.value = getClientX(e);
};

const onMove = (e: MouseEvent | TouchEvent) => {
	if (!isDragging.value) return;
	const currentX = getClientX(e);
	const diff = currentX - startX.value;
	const isAtStart = currentIndex.value === 0 && diff > 0;
	const isAtEnd = currentIndex.value >= maxIndex.value && diff < 0;
	dragOffset.value = isAtStart || isAtEnd ? diff * 0.2 : diff;
};

const onEnd = () => {
	if (!isDragging.value) return;
	if (dragOffset.value < -50) moveNextManual();
	else if (dragOffset.value > 50) movePrevManual();
	isDragging.value = false;
	dragOffset.value = 0;
};

let interval: any = null;

const startAutoPlay = () => {
	if (interval) clearInterval(interval);
	interval = setInterval(() => {
		if (!isPaused.value) moveNextAuto();
	}, 4000);
};

onMounted(() => {
	updateVisibleCount();
	window.addEventListener("resize", updateVisibleCount);
	startAutoPlay();
	nextTick(() => (isMounted.value = true));
});

onUnmounted(() => {
	if (interval) clearInterval(interval);
	window.removeEventListener("resize", updateVisibleCount);
});

const { t } = useMultiLang(["interface"]);
</script>

<template>
	<div class="slider-wrapper relative w-full overflow-hidden py-4">
		<div
			class="slider-track flex touch-pan-y transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
			:class="{ 'transition-none': isDragging }"
			:style="{
				transform: `translateX(calc(-${currentIndex} * var(--slide-width) + ${dragOffset}px))`,
			}"
			@mousedown="onStart"
			@mousemove="onMove"
			@mouseup="onEnd"
			@mouseleave="onEnd"
			@touchstart="onStart"
			@touchmove="onMove"
			@touchend="onEnd"
		>
			<div
				v-for="(item, index) in items"
				:key="index"
				class="slider-item shrink-0 px-1.5 flex select-none"
			>
				<div
					class="card-inner w-full bg-white dark:bg-zinc-900 rounded-2xl p-5 md:p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col pointer-events-none"
				>
					<div class="grow">
						<p
							class="text-zinc-700 dark:text-zinc-300 text-sm md:text-[15px] leading-snug"
						>
							{{ item.text }}
						</p>
					</div>

					<div
						v-if="item.name || item.link || item.avatar"
						class="mt-4 pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between"
					>
						<div class="flex items-center gap-3">
							<div
								v-if="item.avatar"
								class="relative w-10 h-10 shrink-0 rounded-full overflow-hidden avatar-skeleton bg-zinc-100 dark:bg-zinc-800"
							>
								<ImgWithLoader
									:src="item.avatar"
									class="avatar-img w-full h-full object-cover"
									alt="Reviewer"
								/>
							</div>

							<div v-if="item.name || item.city">
								<div
									v-if="item.name"
									class="font-bold text-zinc-900 dark:text-white text-sm leading-tight"
								>
									{{ item.name }}
								</div>

								<div
									v-if="item.city"
									class="text-zinc-400 text-xs mt-0.5"
								>
									{{ item.city }}
								</div>
							</div>
						</div>

						<a
							v-if="item.link"
							:href="item.link"
							class="text-blue-500 dark:text-blue-400 text-xs font-medium hover:underline pointer-events-auto shrink-0 ml-4"
							target="_blank"
						>
							{{ t("interface.goMore") }} →
						</a>
					</div>
				</div>
			</div>
		</div>

		<div
			class="pagination-container flex justify-center gap-1.5 mt-6 transition-opacity duration-500 h-1"
			:class="{ 'opacity-0': !isMounted, 'opacity-100': isMounted }"
		>
			<button
				v-for="(_, i) in items.length - visibleCount + 1"
				:key="i"
				@click="
					currentIndex = i;

					isPaused = true;
				"
				class="h-full rounded-full transition-all duration-300"
				:class="
					currentIndex === i
						? 'w-6 bg-zinc-800 dark:bg-zinc-200'
						: 'w-1.5 bg-zinc-200 dark:bg-zinc-700'
				"
			></button>
		</div>
	</div>
</template>

<style scoped>
.slider-wrapper {
	--slide-width: 100%;
}

@media (min-width: 768px) {
	.slider-wrapper {
		--slide-width: 25%;
	}
}

.slider-item {
	width: var(--slide-width);
}

.slider-track {
	align-items: stretch;
	cursor: grab;
}

.slider-track:active {
	cursor: grabbing;
}

.select-none {
	user-select: none;
	-webkit-user-drag: none;
}
</style>
