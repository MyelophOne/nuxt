<template>
	<div
		data-nosnippet
		:class="[
			!isMounted
				? 'opacity-0 select-none pointer-events-none'
				: 'opacity-100',
		]"
		class="transition-opacity duration-300"
	>
		<slot
			:days="timeLeft.days"
			:hours="timeLeft.hours"
			:minutes="timeLeft.minutes"
			:seconds="timeLeft.seconds"
			:daysLabel="labels.days"
			:hoursLabel="labels.hours"
			:minutesLabel="labels.minutes"
			:secondsLabel="labels.seconds"
		>
			<div class="countdown-default">
				{{ timeLeft.days }} {{ labels.days }} {{ timeLeft.hours }}:{{
					timeLeft.minutes
				}}:{{ timeLeft.seconds }}
			</div>
		</slot>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	targetDate: string | Date;
	timezone?: string;
}>();

const emit = defineEmits(["finish"]);

const { t } = useMultiLang(["times"]);
const pinia = useNuxtApp().$pinia;
const settingsStore = useSettingsStore(pinia);

const isMounted = ref(false);
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
let timer: any = null;

const getLabel = (value: number, key: string) => {
	const locale = settingsStore.currentLocale || "en";
	try {
		const pr = new Intl.PluralRules(locale);
		const rule = pr.select(value);
		let suffix = "5";

		if (rule === "one") {
			suffix = "1";
		} else if (rule === "few") {
			suffix = "";
		} else if (rule === "many") {
			suffix = "5";
		} else if (locale === "en" && rule === "other") {
			suffix = "2";
		}
		return t(`times.${key}${suffix}`);
	} catch (e) {
		console.error("Pluralization error", e);
		return "";
	}
};

const labels = computed(() => ({
	days: getLabel(timeLeft.value.days, "day"),
	hours: getLabel(timeLeft.value.hours, "hour"),
	minutes: getLabel(timeLeft.value.minutes, "minute"),
	seconds: getLabel(timeLeft.value.seconds, "second"),
}));

const getTargetTime = () => {
	if (props.targetDate instanceof Date) return props.targetDate.getTime();

	const parts = props.targetDate.match(
		/^(\d{2})[./-](\d{2})[./-](\d{4})(?:\s+(\d{2}):(\d{2}))?/,
	);
	if (!parts) return new Date(props.targetDate).getTime();

	const [_, d, m, y, h, min] = parts;

	const date = new Date(
		Date.UTC(
			Number(y),
			Number(m) - 1,
			Number(d),
			Number(h || 0),
			Number(min || 0),
		),
	);

	if (props.timezone) {
		try {
			const formatter = new Intl.DateTimeFormat("en-US", {
				timeZone: props.timezone,
				year: "numeric",
				month: "numeric",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				hour12: false,
			});

			const p = formatter.formatToParts(date);
			const getP = (type: string) =>
				parseInt(p.find((x) => x.type === type)?.value || "0");

			const tzDate = new Date(
				Date.UTC(
					getP("year"),
					getP("month") - 1,
					getP("day"),
					getP("hour"),
					getP("minute"),
					getP("second"),
				),
			);

			return date.getTime() - (tzDate.getTime() - date.getTime());
		} catch (e) {
			console.warn("Invalid timezone, falling back to local");
		}
	}

	return new Date(
		Number(y),
		Number(m) - 1,
		Number(d),
		Number(h || 0),
		Number(min || 0),
	).getTime();
};

const updateCountdown = () => {
	const target = getTargetTime();
	const now = Date.now();
	const distance = target - now;

	if (distance <= 0) {
		timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
		if (timer) clearInterval(timer);
		emit("finish");
		return;
	}

	timeLeft.value = {
		days: Math.floor(distance / (1000 * 60 * 60 * 24)),
		hours: Math.floor(
			(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
		),
		minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
		seconds: Math.floor((distance % (1000 * 60)) / 1000),
	};
};

onMounted(() => {
	updateCountdown();
	timer = setInterval(updateCountdown, 1000);
	setTimeout(() => {
		isMounted.value = true;
	}, 50);
});

onBeforeUnmount(() => {
	if (timer) clearInterval(timer);
});

watch(
	[() => props.targetDate, () => settingsStore.currentLocale],
	updateCountdown,
);
</script>

<style scoped>
.countdown-default {
	font-feature-settings: "tnum";
	font-variant-numeric: tabular-nums;
}
</style>
