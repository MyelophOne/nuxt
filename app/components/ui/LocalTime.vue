<template>
	<div class="ui-local-time" :class="containerClass">
		<div v-if="label" class="time-label">
			{{ label }}
		</div>

		<div class="dynamic-content" :class="{ 'is-ready': isMounted }">
			<div class="time-value">
				<template v-if="!isMounted">
					<span class="time-main">00:00</span>
					<span v-if="showSeconds" class="time-seconds">:00</span>
					<span v-if="!is24" class="time-period">AM</span>
				</template>
				<template v-else>
					<span class="time-main"
						>{{ timeParts.hours }}:{{ timeParts.minutes }}</span
					>
					<span v-if="showSeconds" class="time-seconds"
						>:{{ timeParts.seconds }}</span
					>
					<span v-if="!is24" class="time-period">{{
						timeParts.dayPeriod
					}}</span>
				</template>
			</div>

			<div v-if="showDate" class="date-value">
				<span v-if="!isMounted" class="date-placeholder">&nbsp;</span>
				<span v-else>{{ currentDate }}</span>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	timezone: { type: String, required: true },
	label: { type: String, default: "" },
	showDate: { type: Boolean, default: false },
	showSeconds: { type: Boolean, default: false },
	is24: { type: Boolean, default: true },
	containerClass: { type: String, default: "" },
});

const settingsStore = useSettingsStore();
const now = ref(new Date());
const isMounted = ref(false);
let timer = null;

onMounted(() => {
	isMounted.value = true;
	timer = setInterval(() => {
		now.value = new Date();
	}, 1000);
});

onBeforeUnmount(() => {
	if (timer) clearInterval(timer);
});

const timeParts = computed(() => {
	const formatter = new Intl.DateTimeFormat(
		settingsStore.currentLocale || "en-US",
		{
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: !props.is24,
			timeZone: props.timezone,
		},
	);

	const parts = formatter.formatToParts(now.value);
	const getPart = (type) => parts.find((p) => p.type === type)?.value || "";

	return {
		hours: getPart("hour"),
		minutes: getPart("minute"),
		seconds: getPart("second"),
		dayPeriod: getPart("dayPeriod") || getPart("ampm"),
	};
});

const currentDate = computed(() => {
	if (!props.showDate) return "";
	return new Intl.DateTimeFormat(settingsStore.currentLocale || "en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: props.timezone,
	}).format(now.value);
});
</script>

<style scoped>
.ui-local-time {
	display: flex;
	flex-direction: column;
	color: var(--ui-text);
	font-variant-numeric: tabular-nums;
}

.time-label {
	height: 14px;
	font-size: 0.75rem;
	opacity: 0.5;
	text-transform: uppercase;
	letter-spacing: 0.03em;
	margin-bottom: 4px;
	line-height: 1;
}

.dynamic-content {
	opacity: 0;
	transition: opacity 0.4s ease-in-out;
}

.dynamic-content.is-ready {
	opacity: 1;
}

.time-value {
	height: 1.5rem;
	font-size: 1.5rem;
	line-height: 1.5rem;
	font-weight: 400;
	display: flex;
	align-items: baseline;
	white-space: nowrap;
}

.time-main {
	font-size: 1.5rem;
	line-height: 1;
}

.time-seconds {
	opacity: 0.5;
	font-size: 1rem;
	margin-left: 1px;
}

.time-period {
	font-size: 0.9rem;
	font-weight: 500;
	text-transform: uppercase;
	margin-left: 6px;
}

.date-value {
	height: 1.25rem;
	line-height: 1.25rem;
	font-size: 0.9rem;
	opacity: 0.6;
	margin-top: 4px;
	text-transform: capitalize;
}

.is-compact .time-value {
	height: 1rem;
	line-height: 1rem;
}
.is-compact .time-main {
	font-size: 1rem;
}
.is-compact .time-seconds,
.is-compact .time-period {
	font-size: 0.7rem;
}
</style>
