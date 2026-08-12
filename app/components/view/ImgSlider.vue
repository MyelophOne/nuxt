<script setup lang="ts">
export type ImageItem = { type: "image"; uri: string };
export type VideoItem = { type: "video"; uri: string; poster?: string };
export type MediaItem = ImageItem | VideoItem;

const props = withDefaults(
	defineProps<{
		media: MediaItem[];
		autoScroll?: boolean;
		autoScrollInterval?: number;
		vertical?: boolean;
	}>(),
	{
		autoScroll: true,
		autoScrollInterval: 4000,
		vertical: false,
	},
);

const activeIndex = ref(0);
const scrollerRef = ref<HTMLElement | null>(null);
const videoRefs = ref<(HTMLVideoElement | null)[]>([]);
const scrollIntervalId = ref<any>(null);
const isAutoScrollDisabled = ref(false);

const stopAutoScrollPermanently = () => {
	isAutoScrollDisabled.value = true;
	if (scrollIntervalId.value) {
		clearInterval(scrollIntervalId.value);
		scrollIntervalId.value = null;
	}
};

const onScroll = () => {
	if (!scrollerRef.value) return;
	const scrollLeft = scrollerRef.value.scrollLeft;
	const width = scrollerRef.value.clientWidth;
	const index = Math.round(scrollLeft / width);

	if (
		index !== activeIndex.value &&
		index >= 0 &&
		index < props.media.length
	) {
		activeIndex.value = index;
	}
};

const scrollToSlide = (index: number, isManual = false) => {
	if (isManual) stopAutoScrollPermanently();

	if (!scrollerRef.value) return;
	const width = scrollerRef.value.clientWidth;
	scrollerRef.value.scrollTo({
		left: index * width,
		behavior: "smooth",
	});
};

const nextSlide = (isManual = false) => {
	const nextIndex = (activeIndex.value + 1) % props.media.length;
	scrollToSlide(nextIndex, isManual);
};

const prevSlide = (isManual = false) => {
	const prevIndex =
		(activeIndex.value - 1 + props.media.length) % props.media.length;
	scrollToSlide(prevIndex, isManual);
};

const manageVideos = async () => {
	await nextTick();
	props.media.forEach((item, i) => {
		if (item.type !== "video") return;
		const videoEl = videoRefs.value[i];
		if (!videoEl) return;

		if (i === activeIndex.value) {
			videoEl.play().catch(() => {});
		} else {
			videoEl.pause();
			videoEl.currentTime = 0;
		}
	});
};

const handleTouchStart = () => {
	stopAutoScrollPermanently();
};

watch(activeIndex, () => {
	manageVideos();
});

onMounted(() => {
	manageVideos();

	if (
		props.autoScroll &&
		props.media.length > 1 &&
		!isAutoScrollDisabled.value
	) {
		scrollIntervalId.value = setInterval(() => {
			nextSlide(false);
		}, props.autoScrollInterval);
	}
});

onUnmounted(() => {
	if (scrollIntervalId.value) clearInterval(scrollIntervalId.value);
});

const setVideoRef = (el: any, index: number) => {
	videoRefs.value[index] = el as HTMLVideoElement;
};
</script>

<template>
	<div
		class="slider-root"
		:class="{ 'is-vertical-mode': vertical }"
		@touchstart.passive="handleTouchStart"
		@mousedown="handleTouchStart"
	>
		<div ref="scrollerRef" class="scroller" @scroll.passive="onScroll">
			<div v-for="(item, index) in media" :key="index" class="slide">
				<ImgWithLoader
					v-if="item.type === 'image'"
					:src="item.uri"
					class="media-content"
					loading="lazy"
					draggable="false"
				/>

				<video
					v-else
					:ref="(el) => setVideoRef(el, index)"
					:src="item.uri"
					:poster="item.poster"
					class="media-content"
					playsinline
					loop
					muted
					preload="metadata"
				></video>
			</div>
		</div>

		<template v-if="media.length > 1">
			<button
				class="nav-btn prev"
				@click.stop="prevSlide(true)"
				aria-label="Previous slide"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 19.5L8.25 12l7.5-7.5"
					/>
				</svg>
			</button>

			<button
				class="nav-btn next"
				@click.stop="nextSlide(true)"
				aria-label="Next slide"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8.25 4.5l7.5 7.5-7.5 7.5"
					/>
				</svg>
			</button>
		</template>

		<div class="dots-container">
			<div
				v-for="(_, i) in media"
				:key="i"
				class="dot"
				:class="{ active: i === activeIndex }"
				@click.stop="scrollToSlide(i, true)"
			></div>
		</div>
	</div>
</template>

<style scoped>
.slider-root {
	position: relative;
	width: 100%;
	overflow: hidden;
	touch-action: pan-x;
	height: 230px;
	max-height: 90vh;
}

@media (min-width: 769px) {
	.slider-root {
		height: 500px;
	}
}

.slider-root.is-vertical-mode {
	width: 500px;
	max-width: 100%;
	height: 90vh;
	margin: 0 auto;
}

@media (min-width: 769px) {
	.slider-root.is-vertical-mode {
		height: 720px;
	}
}

.scroller {
	display: flex;
	width: 100%;
	height: 100%;
	overflow-x: auto;
	overflow-y: hidden;
	scroll-snap-type: x mandatory;
	scroll-behavior: smooth;
	scrollbar-width: none;
}
.scroller::-webkit-scrollbar {
	display: none;
}

.slide {
	flex: 0 0 100%;
	width: 100%;
	height: 100%;
	scroll-snap-align: center;
	position: relative;
	scroll-snap-stop: always;
}

.media-content {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	border-radius: 0.5rem;
}

.nav-btn {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 44px;
	height: 44px;
	border-radius: 50%;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	z-index: 20;
	transition: all 0.2s ease;
	opacity: 0;
}

.nav-btn svg {
	width: 24px;
	height: 24px;
}

.slider-root:hover .nav-btn {
	opacity: 1;
}

.nav-btn:hover {
	opacity: 1;
}

.prev {
	left: 16px;
}

.next {
	right: 16px;
}

.dots-container {
	position: absolute;
	bottom: 16px;
	width: 100%;
	display: flex;
	justify-content: center;
	gap: 8px;
	z-index: 10;
	pointer-events: none;
}

.dot {
	height: 6px;
	width: 6px;
	border-radius: 3px;
	background-color: rgba(255, 255, 255, 0.5);
	transition: all 0.3s ease;
	cursor: pointer;
	pointer-events: auto;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dot.active {
	background-color: #fff;
	width: 16px;
}

@media (max-width: 768px) {
	.nav-btn {
		display: none !important;
	}
}
</style>
