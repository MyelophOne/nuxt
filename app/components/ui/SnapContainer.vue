<script setup lang="ts">
const props = defineProps<{ direction?: "vertical" | "horizontal" }>();
const containerRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const isAnimating = ref(false);
const sectionsCount = ref(0);
const isVertical = computed(
	() => (props.direction || "vertical") === "vertical",
);

provide("snapActiveIndex", currentIndex);
provide("snapIsVertical", isVertical);

let isIntersecting = false;
let intersectionRatio = 0;
let touchStartY = 0;
let touchStartX = 0;

const scrollTo = (index: number, scrollPage: boolean = true) => {
	if (isAnimating.value || index < 0 || index >= sectionsCount.value) return;

	isAnimating.value = true;
	currentIndex.value = index;

	if (scrollPage && wrapperRef.value) {
		const rect = wrapperRef.value.getBoundingClientRect();
		const behavior = Math.abs(rect.top) > 50 ? "smooth" : "auto";
		window.scrollTo({ top: window.scrollY + rect.top, behavior });
	}

	setTimeout(() => {
		isAnimating.value = false;
	}, 1200);
};

const processMove = (delta: number, preventDefault?: () => void) => {
	if (!wrapperRef.value || !isIntersecting) return;
	const rect = wrapperRef.value.getBoundingClientRect();
	const isAligned = Math.abs(rect.top) < 10;

	if (!isAligned) {
		if (intersectionRatio > 0.5) {
			if (rect.top > 0 && delta > 0) {
				preventDefault?.();
				scrollTo(0, true);
				return;
			}
			if (rect.top < 0 && delta < 0) {
				preventDefault?.();
				scrollTo(sectionsCount.value - 1, true);
				return;
			}
		}
		return;
	}

	if (isAnimating.value) {
		preventDefault?.();
		return;
	}

	const isAtFirst = currentIndex.value === 0;
	const isAtLast = currentIndex.value === sectionsCount.value - 1;

	if ((isAtFirst && delta < 0) || (isAtLast && delta > 0)) return;

	preventDefault?.();
	if (Math.abs(delta) > 20) {
		scrollTo(
			delta > 0 ? currentIndex.value + 1 : currentIndex.value - 1,
			true,
		);
	}
};

const handleWheel = (e: WheelEvent) => {
	processMove(e.deltaY, () => e.preventDefault());
};

const onTouchStart = (e: TouchEvent) => {
	const touch = e.touches[0];
	if (!touch) return;

	touchStartY = touch.clientY;
	touchStartX = touch.clientX;
};

const onTouchMove = (e: TouchEvent) => {
	if (!isIntersecting) return;

	const touch = e.touches[0];
	if (!touch) return;

	const currentY = touch.clientY;
	const currentX = touch.clientX;
	const deltaY = touchStartY - currentY;
	const deltaX = touchStartX - currentX;
	const delta = isVertical.value ? deltaY : deltaX;

	const rect = wrapperRef.value?.getBoundingClientRect();
	const isAligned = rect && Math.abs(rect.top) < 10;

	if (isAligned) {
		const isAtFirst = currentIndex.value === 0;
		const isAtLast = currentIndex.value === sectionsCount.value - 1;
		const tryingToExitTop = isAtFirst && delta < 0;
		const tryingToExitBottom = isAtLast && delta > 0;

		if (!tryingToExitTop && !tryingToExitBottom) {
			if (e.cancelable) e.preventDefault();
		}
	}
};

const onTouchEnd = (e: TouchEvent) => {
	const touch = e.changedTouches[0];
	if (!touch) return;

	const endY = touch.clientY;
	const endX = touch.clientX;
	const delta = isVertical.value ? touchStartY - endY : touchStartX - endX;

	if (Math.abs(delta) > 40) {
		processMove(delta);
	}
};

onMounted(() => {
	sectionsCount.value =
		containerRef.value?.querySelectorAll(".snap-section").length || 0;
	window.addEventListener("wheel", handleWheel, { passive: false });

	const el = wrapperRef.value;
	if (el) {
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		el.addEventListener("touchend", onTouchEnd, { passive: true });
	}

	const observer = new IntersectionObserver(
		(entries) => {
			const entry = entries[0];
			if (!entry) return;

			isIntersecting = entry.isIntersecting;
			intersectionRatio = entry.intersectionRatio;
		},
		{ threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
	);
	if (wrapperRef.value) observer.observe(wrapperRef.value);
});

onUnmounted(() => {
	window.removeEventListener("wheel", handleWheel);
});

const resetToFirst = () => {
	console.log("Сигнал получен: сбрасываю currentIndex в 0");
	isAnimating.value = false;
	scrollTo(0, false);
	currentIndex.value = 0;
};

const { registerContainer } = useSnapScroll();
registerContainer(resetToFirst);

provide("snapActiveIndex", currentIndex);
</script>

<template>
	<div
		ref="wrapperRef"
		class="relative w-full h-dvh overflow-hidden select-none1"
		:style="{
			backgroundColor: 'var(--ui-bg, #000)',
			color: 'var(--ui-text, #fff)',
		}"
	>
		<div
			class="absolute z-50 flex gap-2"
			:class="[
				isVertical
					? 'right-6 top-1/2 -translate-y-1/2 flex-col'
					: 'bottom-6 left-1/2 -translate-x-1/2 flex-row',
			]"
		>
			<button
				v-for="(_, i) in sectionsCount"
				:key="i"
				@click="scrollTo(i)"
				class="group flex items-center justify-center w-1 h-4 focus:outline-none"
			>
				<div
					class="transition-all duration-500 rounded-full"
					:style="{
						backgroundColor:
							'var(--loader-fill-color, currentColor)',
					}"
					:class="
						currentIndex === i
							? 'w-3 h-3 opacity-100'
							: 'w-1.5 h-2 opacity-20 hover:opacity-100'
					"
				/>
			</button>
		</div>

		<div
			ref="containerRef"
			class="w-full h-full will-change-transform flex transition-transform duration-1200 ease-[cubic-bezier(0.22,1,0.36,1)]"
			:class="[isVertical ? 'flex-col' : 'flex-row']"
			:style="{
				transform: isVertical
					? `translateY(-${currentIndex * 100}%)`
					: `translateX(-${currentIndex * 100}%)`,
			}"
		>
			<slot />
		</div>
	</div>
</template>
