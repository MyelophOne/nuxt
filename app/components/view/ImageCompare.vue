<template>
	<div
		ref="container"
		class="relative w-full h-full select-none touch-none isolate rounded-xl overflow-hidden cursor-ew-resize group bg-(--ui-bg) transform-gpu"
		@mousedown="startSliding"
		@touchstart="startSliding"
	>
		<div class="absolute inset-0 w-full h-full z-0">
			<ImgWithLoader
				:src="afterImage"
				class="block w-full h-full object-cover pointer-events-none select-none"
				draggable="false"
			/>

			<div class="absolute bottom-4 right-4 z-40 pointer-events-none">
				<span
					class="bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs font-bold rounded whitespace-nowrap shadow-lg"
				>
					{{ afterLabel }}
				</span>
			</div>
		</div>

		<div
			class="absolute inset-0 w-full h-full z-10 will-change-[clip-path]"
			:style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"
		>
			<div class="relative w-full h-full z-0">
				<ImgWithLoader
					:src="beforeImage"
					class="block w-full h-full object-cover pointer-events-none select-none"
					draggable="false"
				/>
			</div>

			<div class="absolute bottom-4 left-4 z-40 pointer-events-none">
				<span
					class="bg-black/60 backdrop-blur-md text-white px-3 py-1 text-xs font-bold rounded whitespace-nowrap shadow-lg"
				>
					{{ beforeLabel }}
				</span>
			</div>
		</div>

		<div
			class="absolute top-0 bottom-0 z-30 w-0.5 bg-white cursor-ew-resize pointer-events-none"
			:style="{ left: `${position}%` }"
		>
			<div
				class="absolute inset-0 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
			></div>
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] transform transition-transform group-active:scale-110"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			</div>
		</div>

		<div
			class="absolute inset-0 z-50 rounded-xl pointer-events-none ring-1 ring-inset ring-(--ui-text)/20"
		></div>
	</div>
</template>

<script setup>
const props = defineProps({
	beforeImage: String,
	afterImage: String,
	beforeLabel: String,
	afterLabel: String,
});

const container = ref(null);
const position = ref(50);
const isSliding = ref(false);

const startSliding = (e) => {
	isSliding.value = true;
	move(e);
	window.addEventListener("mousemove", move);
	window.addEventListener("mouseup", stopSliding);
	window.addEventListener("touchmove", move, { passive: false });
	window.addEventListener("touchend", stopSliding);
};

const stopSliding = () => {
	isSliding.value = false;
	window.removeEventListener("mousemove", move);
	window.removeEventListener("mouseup", stopSliding);
	window.removeEventListener("touchmove", move);
	window.removeEventListener("touchend", stopSliding);
};

const move = (e) => {
	if (!isSliding.value || !container.value) return;

	let pageX;
	if (e.touches && e.touches.length > 0) {
		pageX = e.touches[0].clientX;
	} else {
		pageX = e.clientX;
	}

	const rect = container.value.getBoundingClientRect();
	let x = pageX - rect.left;

	if (x < 0) x = 0;
	if (x > rect.width) x = rect.width;

	position.value = (x / rect.width) * 100;
};

onUnmounted(() => {
	stopSliding();
});
</script>
