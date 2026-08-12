<template>
	<span
		ref="target"
		class="relative inline-flex flex-col items-center justify-center tabular-nums leading-none whitespace-nowrap"
		:aria-label="`${prefix}${to}${suffix}`"
	>
		<span
			class="opacity-0 select-none pointer-events-none"
			aria-hidden="true"
		>
			{{ prefix }}{{ formattedTarget }}{{ suffix }}
		</span>
		<span
			class="absolute inset-0 flex items-center justify-center"
			aria-hidden="true"
		>
			{{ prefix }}{{ formattedCurrent }}{{ suffix }}
		</span>
	</span>
</template>

<script setup lang="ts">
interface Props {
	to: number;
	from?: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	separator?: string;
	once?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	from: 0,
	duration: 1500,
	prefix: "",
	suffix: "",
	decimals: 0,
	separator: " ",
	once: true,
});

const target = ref<HTMLElement | null>(null);
const current = ref(props.from);
const hasAnimated = ref(false);

const formatNumber = (num: number) => {
	return new Intl.NumberFormat("ru-RU", {
		minimumFractionDigits: props.decimals,
		maximumFractionDigits: props.decimals,
	})
		.format(num)
		.replace(/,/g, ".");
};

const formattedTarget = computed(() => formatNumber(props.to));
const formattedCurrent = computed(() => formatNumber(current.value));

const animate = () => {
	const startTimestamp = performance.now();
	const startValue = current.value;
	const endValue = props.to;
	const diff = endValue - startValue;

	const step = (timestamp: number) => {
		const elapsed = timestamp - startTimestamp;
		const progress = Math.min(elapsed / props.duration, 1);

		const ease = 1 - Math.pow(1 - progress, 4);

		current.value = startValue + diff * ease;

		if (progress < 1) {
			requestAnimationFrame(step);
		} else {
			current.value = endValue;
		}
	};

	requestAnimationFrame(step);
};

onMounted(() => {
	if (typeof IntersectionObserver === "undefined") {
		animate();
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if (props.once && hasAnimated.value) return;

					if (!hasAnimated.value) current.value = props.from;

					animate();
					hasAnimated.value = true;

					if (props.once) observer.disconnect();
				}
			});
		},
		{ threshold: 0.2 },
	);

	if (target.value) {
		observer.observe(target.value);
	}
});

watch(
	() => props.to,
	() => {
		if (hasAnimated.value) {
			animate();
		}
	},
);
</script>
