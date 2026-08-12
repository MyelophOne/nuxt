<script setup lang="ts">
const props = defineProps<{
	id: string;
	bgClass?: string;
	bgImage?: string;
	bgVideo?: string;
	bgVideoMobile?: string;
	poster?: string;
	posterMobile?: string;
	youtubeId?: string;
	youtubeIdMobile?: string;
	overlay?: boolean | string;
	lazy?: boolean;
	contentClass?: string;
}>();

const sectionRef = ref<HTMLElement | null>(null);
const activeIndex = inject<Ref<number>>("snapActiveIndex", ref(0));
const isVertical = inject<Ref<boolean>>("snapIsVertical");
const myIndex = ref(-1);
const videoRef = ref<HTMLVideoElement | null>(null);
const ytFrameRef = ref<HTMLIFrameElement | null>(null);

const windowWidth = ref(
	typeof window !== "undefined" ? window.innerWidth : 1024,
);

const handleResize = () => {
	windowWidth.value = window.innerWidth;
};

onMounted(() => {
	window.addEventListener("resize", handleResize);
	if (sectionRef.value?.parentElement) {
		myIndex.value = Array.from(
			sectionRef.value.parentElement.children,
		).indexOf(sectionRef.value);
	}
});

onUnmounted(() => {
	window.removeEventListener("resize", handleResize);
});

const isMobile = computed(() => windowWidth.value < 768);

const currentVideo = computed(() =>
	isMobile.value && props.bgVideoMobile ? props.bgVideoMobile : props.bgVideo,
);
const currentPoster = computed(() =>
	isMobile.value && props.posterMobile ? props.posterMobile : props.poster,
);

const currentYoutubeUrl = computed(() => {
	const target =
		isMobile.value && props.youtubeIdMobile
			? props.youtubeIdMobile
			: props.youtubeId;
	return getYoutubeEmbed(target);
});

const currentYoutubePoster = computed(() => {
	const target =
		isMobile.value && props.youtubeIdMobile
			? props.youtubeIdMobile
			: props.youtubeId;
	return getYoutubePoster(target);
});

const parallaxStyle = computed(() => {
	if (activeIndex === undefined || myIndex.value === -1) return {};
	const diff = activeIndex.value - myIndex.value;
	const offset = diff * 20;
	return {
		transform: isVertical?.value
			? `translate3d(0, ${offset}%, 0)`
			: `translate3d(${offset}%, 0, 0)`,
		transition: "transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
	};
});

const overlayStyle = computed(() => {
	if (!props.overlay) return null;
	return {
		background:
			typeof props.overlay === "string"
				? props.overlay
				: "rgba(0, 0, 0, 0.4)",
	};
});

watch(activeIndex, (newIdx) => {
	if (!videoRef.value) return;
	if (newIdx === myIndex.value) {
		videoRef.value.play().catch(() => {});
	} else {
		videoRef.value.pause();
	}
});

const toggleVideo = () => {
	if (!videoRef.value) return;

	if (
		activeIndex?.value === myIndex.value &&
		document.visibilityState === "visible"
	) {
		videoRef.value.play().catch(() => {});
	} else {
		videoRef.value.pause();
	}
};

watch(activeIndex, () => {
	toggleVideo();
});

const sendCommand = (command: "playVideo" | "pauseVideo") => {
	if (!ytFrameRef.value || !ytFrameRef.value.contentWindow) return;

	ytFrameRef.value.contentWindow.postMessage(
		JSON.stringify({
			event: "command",
			func: command,
			args: [],
		}),
		"*",
	);
};

const toggleYoutube = () => {
	if (!currentYoutubeUrl.value) return;

	if (
		activeIndex?.value === myIndex.value &&
		document.visibilityState === "visible"
	) {
		sendCommand("playVideo");
	} else {
		sendCommand("pauseVideo");
	}
};

watch(activeIndex, () => {
	toggleYoutube();
});

const handleVisibilityChange = () => {
	toggleVideo();
	toggleYoutube();
};

onMounted(() => {
	document.addEventListener("visibilitychange", handleVisibilityChange);
	toggleVideo();
	setTimeout(toggleYoutube, 1000);
});

onUnmounted(() => {
	document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
	<section
		ref="sectionRef"
		:id="id"
		class="snap-section w-full h-full shrink-0 overflow-hidden flex relative"
		:class="bgClass"
		:style="
			!bgClass && !bgImage && !bgVideo && !youtubeId
				? { backgroundColor: 'var(--ui-bg, #000)' }
				: {}
		"
	>
		<div class="absolute inset-0 z-0 pointer-events-none select-none">
			<div
				v-if="currentYoutubeUrl"
				class="absolute inset-0 overflow-hidden"
			>
				<iframe
					ref="ytFrameRef"
					:src="currentYoutubeUrl"
					class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 yt-bg-frame"
					frameborder="0"
					allow="autoplay; encrypted-media; playsinline"
					:loading="lazy ? 'lazy' : 'eager'"
				></iframe>
			</div>

			<video
				ref="videoRef"
				v-else-if="currentVideo"
				autoplay
				muted
				loop
				loading="lazy"
				playsinline
				:poster="currentPoster"
				class="absolute inset-0 w-full h-full object-cover"
			>
				<source :src="currentVideo" />
			</video>

			<div
				v-else-if="bgImage || currentYoutubePoster"
				class="absolute inset-0 bg-cover bg-center bg-no-repeat"
				:style="{
					backgroundImage: bgImage
						? `url(${bgImage})`
						: currentYoutubePoster,
				}"
			>
				<SafeNuxtImg
					v-if="lazy && bgImage"
					:src="bgImage"
					class="hidden"
					loading="lazy"
					alt=""
				/>
			</div>

			<div
				v-if="overlay"
				class="absolute inset-0 z-1"
				:style="overlayStyle"
			></div>
		</div>

		<div
			class="w-full max-w-7xl mx-auto px-6 will-change-transform z-10 relative pointer-events-auto select-text"
			:class="[
				contentClass || 'flex flex-col items-center justify-center',
				parallaxStyle,
			]"
			:style="parallaxStyle"
		>
			<div class="w-full"><slot /></div>
		</div>

		<div
			v-if="myIndex === 0"
			class="absolute z-20 transition-opacity duration-1000"
			:class="[
				isVertical
					? 'bottom-8 left-1/2 -translate-x-1/2'
					: 'right-8 top-1/2 -translate-y-1/2',
				activeIndex === 0 ? 'opacity-40' : 'opacity-0',
			]"
		>
			<div
				class="relative overflow-hidden bg-current/20 rounded-full"
				:class="isVertical ? 'w-[1.5px] h-12' : 'h-[1.5px] w-12'"
				:style="{ color: 'var(--loader-fill-color, currentColor)' }"
			>
				<div
					class="absolute bg-current rounded-full animate-premium-scroll"
					:class="
						isVertical
							? 'w-full h-1/3 left-0'
							: 'h-full w-1/3 top-0'
					"
				></div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.yt-bg-frame {
	width: 100vw;
	height: 56.25vw;
	min-height: 100vh;
	min-width: 177.77vh;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 140%;
	height: 140%;
	transform: translate(-50%, -50%);
	aspect-ratio: 16 / 9;
	min-width: 100%;
	min-height: 100%;
}

@media (max-width: 768px) {
	.yt-bg-frame {
		height: 100%;
		width: auto;
		aspect-ratio: 16 / 9;
		min-width: 200vw;
	}
}
</style>
