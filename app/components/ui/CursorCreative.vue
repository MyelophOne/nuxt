<template>
	<div v-if="cursorEnabled">
		<div
			ref="cursorDot"
			class="fixed top-0 left-0 w-1 h-1 rounded-full pointer-events-none z-10000 transition-opacity duration-300 ease-out"
			:class="[
				shouldHide ? 'opacity-0' : 'opacity-100',
				'bg-(--ui-text)',
			]"
		></div>

		<div
			ref="cursorCircle"
			class="fixed top-0 left-0 w-7 h-7 border-2 rounded-full pointer-events-none z-9999 transition-opacity duration-300 ease-out"
			:class="[
				shouldHide ? 'opacity-0' : 'opacity-100',
				'border-(--ui-text)',
			]"
		></div>
	</div>
</template>

<script setup>
const cursorDot = ref(null);
const cursorCircle = ref(null);
const cursorEnabled = ref(false);
const shouldHide = ref(false);

const mouse = { x: -100, y: -100 };
const circlePos = { x: -100, y: -100 };
const smoothing = 0.15;
const circleRadius = 20;
const dotRadius = 4;
const maxDistance = circleRadius - dotRadius;

let animationFrameId = null;

const checkHover = (target) => {
	if (!target) return;

	const isInteractive =
		target.closest &&
		target.closest(
			'a, button, input, textarea, select, [role="button"], iframe, .tally-component-wrapper',
		);

	shouldHide.value = !!isInteractive;
};

const onMouseMove = (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	checkHover(e.target);
};

const onMouseOut = (e) => {
	if (!e.relatedTarget) {
		shouldHide.value = true;
	} else {
		checkHover(e.relatedTarget);
	}
};

const animate = () => {
	if (!cursorEnabled.value || !cursorDot.value || !cursorCircle.value) return;

	circlePos.x += (mouse.x - circlePos.x) * smoothing;
	circlePos.y += (mouse.y - circlePos.y) * smoothing;

	const deltaX = mouse.x - circlePos.x;
	const deltaY = mouse.y - circlePos.y;
	const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

	let dotX, dotY;

	if (distance > maxDistance) {
		const angle = Math.atan2(deltaY, deltaX);
		dotX = circlePos.x + Math.cos(angle) * maxDistance;
		dotY = circlePos.y + Math.sin(angle) * maxDistance;
	} else {
		dotX = mouse.x;
		dotY = mouse.y;
	}

	cursorCircle.value.style.transform = `translate3d(${circlePos.x}px, ${circlePos.y}px, 0) translate(-50%, -50%)`;
	cursorDot.value.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

	animationFrameId = requestAnimationFrame(animate);
};

const checkEnvironment = () => {
	const reducedMotionQuery = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	);
	const hasFinePointerQuery = window.matchMedia("(pointer: fine)");

	const shouldEnable =
		!reducedMotionQuery.matches && hasFinePointerQuery.matches;

	if (shouldEnable !== cursorEnabled.value) {
		cursorEnabled.value = shouldEnable;

		if (shouldEnable) {
			setTimeout(() => {
				if (typeof window === "undefined") return;

				mouse.x = window.innerWidth / 2;
				mouse.y = window.innerHeight / 2;
				circlePos.x = mouse.x;
				circlePos.y = mouse.y;

				window.addEventListener("mousemove", onMouseMove, {
					passive: true,
				});
				document.addEventListener("mouseout", onMouseOut, {
					passive: true,
				});

				animate();
			}, 50);
		} else {
			window.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseout", onMouseOut);
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		}
	}
};

onMounted(() => {
	if (typeof window !== "undefined") {
		checkEnvironment();
		window
			.matchMedia("(prefers-reduced-motion: reduce)")
			.addEventListener("change", checkEnvironment);
		window
			.matchMedia("(pointer: fine)")
			.addEventListener("change", checkEnvironment);
	}
});

onUnmounted(() => {
	if (typeof window !== "undefined") {
		window.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseout", onMouseOut);
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
	}
});
</script>
