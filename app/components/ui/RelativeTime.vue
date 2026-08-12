<script setup lang="ts">
const props = defineProps({
	date: {
		type: [String, Number, Date],
		required: true,
	},
	locale: { type: String, default: undefined },
	tag: { type: String, default: "span" },
	short: { type: Boolean, default: false },
});

const settingsStore = useSettingsStore();
const currentLocale = computed(
	() =>
		props.locale ||
		settingsStore.currentLocale ||
		settingsStore.defaultLocale ||
		"en",
);

const getDate = (val: string | number | Date) =>
	val instanceof Date ? val : new Date(val);

const isoString = computed(() => {
	try {
		return getDate(props.date).toISOString();
	} catch (e) {
		return "";
	}
});

const fullTitle = computed(() => {
	try {
		return new Intl.DateTimeFormat(currentLocale.value, {
			dateStyle: "full",
			timeStyle: "short",
		}).format(getDate(props.date));
	} catch (e) {
		return "";
	}
});

const displayTime = ref("");
let timer: ReturnType<typeof setTimeout> | null = null;

const update = () => {
	if (timer) clearTimeout(timer);

	const targetDate = getDate(props.date);
	const diffSec = (targetDate.getTime() - Date.now()) / 1000;
	const absDiffSec = Math.abs(diffSec);

	const rtf = new Intl.RelativeTimeFormat(currentLocale.value, {
		numeric: "auto",
		style: props.short ? "short" : "long",
	});

	let text = "";
	if (absDiffSec < 60) text = rtf.format(Math.round(diffSec), "second");
	else if (absDiffSec < 3600)
		text = rtf.format(Math.round(diffSec / 60), "minute");
	else if (absDiffSec < 86400)
		text = rtf.format(Math.round(diffSec / 3600), "hour");
	else if (absDiffSec < 604800)
		text = rtf.format(Math.round(diffSec / 86400), "day");
	else if (absDiffSec < 2419200)
		text = rtf.format(Math.round(diffSec / 604800), "week");
	else if (absDiffSec < 29030400)
		text = rtf.format(Math.round(diffSec / 2592000), "month");
	else text = rtf.format(Math.round(diffSec / 31536000), "year");

	displayTime.value = text;

	const diffMin = absDiffSec / 60;
	let delay = 60000;
	if (diffMin < 1) delay = 10000;
	else if (diffMin >= 60) delay = 3600000;
	else if (diffMin >= 15) delay = 300000;

	timer = setTimeout(update, delay);
};

watch(() => [props.date, currentLocale.value, props.short], update);
onMounted(() => update());
onUnmounted(() => {
	if (timer) clearTimeout(timer);
});
</script>

<template>
	<ClientOnly>
		<component
			:is="tag"
			:datetime="tag === 'time' ? isoString : undefined"
			:title="fullTitle"
			class="relative-time"
			data-nosnippet
		>
			{{ displayTime }}
		</component>

		<template #fallback>
			<span class="skeleton" data-nosnippet aria-hidden="true"></span>
		</template>
	</ClientOnly>
</template>

<style scoped>
.relative-time {
	white-space: nowrap;
}

.skeleton {
	display: inline-block;
	height: 0.9em;
	width: 6ch;
	background-color: rgba(0, 0, 0, 0.1);
	border-radius: 4px;
	vertical-align: middle;
	animation: pulse 1.5s infinite ease-in-out;
}

.skeleton {
	display: inline-block;
	height: 1em;
	width: 6ch;
	background-color: transparent;
}

@keyframes pulse {
	0% {
		opacity: 0.6;
	}
	50% {
		opacity: 0.3;
	}
	100% {
		opacity: 0.6;
	}
}
</style>
