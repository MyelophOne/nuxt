<template>
	<div
		ref="container"
		class="relative w-full overflow-hidden group fade-mask"
		:class="containerClass"
	>
		<div
			ref="track"
			class="marquee-track group-hover:!paused"
			:class="{ 'is-running': isStarted }"
			:style="trackStyle"
		>
			<div ref="source" class="marquee-content">
				<span
					v-for="(item, i) in items"
					:key="i"
					class="px-8 uppercase"
				>
					{{ item }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	items: string[];
	duration?: number;
	delay?: number;
	containerClass?: string;
}>();

const container = ref<HTMLElement>();
const track = ref<HTMLElement>();
const source = ref<HTMLElement>();
const isStarted = ref(false);

let resizeObserver: ResizeObserver | null = null;
let startTimeout: number | null = null;

function rebuild() {
	if (!container.value || !track.value || !source.value) return;

	isStarted.value = false;
	track.value.innerHTML = "";
	track.value.appendChild(source.value);

	const containerWidth = container.value.offsetWidth;
	const sourceWidth = source.value.offsetWidth;
	if (!sourceWidth) return;

	const copies = Math.ceil((containerWidth * 2) / sourceWidth);
	for (let i = 0; i < copies; i++) {
		const clone = source.value.cloneNode(true) as HTMLElement;
		clone.setAttribute("aria-hidden", "true");
		clone.classList.add("clone-fade-in");
		track.value.appendChild(clone);
	}

	track.value.style.setProperty("--marquee-distance", `${sourceWidth}px`);

	startTimeout && clearTimeout(startTimeout);
	startTimeout = window.setTimeout(() => {
		isStarted.value = true;
	}, props.delay ?? 1000);
}

onMounted(async () => {
	await nextTick();
	rebuild();
	resizeObserver = new ResizeObserver(() => rebuild());
	resizeObserver.observe(container.value!);
});

onBeforeUnmount(() => {
	resizeObserver?.disconnect();
	startTimeout && clearTimeout(startTimeout);
});

const trackStyle = computed(() => ({
	animationDuration: `${props.duration ?? 30}s`,
}));
</script>

<style scoped>
@keyframes marquee {
	from {
		transform: translate3d(0, 0, 0);
	}
	to {
		transform: translate3d(calc(-1 * var(--marquee-distance)), 0, 0);
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.marquee-track {
	display: flex;
	width: max-content;
	will-change: transform;
	animation: marquee linear infinite;
	animation-play-state: paused;
}

.marquee-track.is-running {
	animation-play-state: running;
}

.group:hover .marquee-track {
	animation-play-state: paused !important;
}

.marquee-content {
	display: flex;
	white-space: nowrap;
	flex-shrink: 0;
}

.clone-fade-in {
	animation: fadeIn 0.5s ease-out forwards;
}

.fade-mask {
	mask-image: linear-gradient(
		to right,
		transparent,
		black 2rem,
		black calc(100% - 2rem),
		transparent
	);
	-webkit-mask-image: linear-gradient(
		to right,
		transparent,
		black 2rem,
		black calc(100% - 2rem),
		transparent
	);
}
</style>
