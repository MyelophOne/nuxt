<template>
	<template v-if="status === 'active'">
		<slot />
	</template>

	<template v-else-if="status === 'upcoming'">
		<slot name="upcoming">
			{{ preText }}
		</slot>
	</template>
</template>

<script setup lang="ts">
type RepeatType = "daily" | "weekly" | "monthly" | "yearly";
type ContentStatus = "active" | "upcoming" | "hidden";

interface Props {
	from?: string | Date;
	to?: string | Date;
	repeat?: RepeatType;
	timezone?: string;
	checkInterval?: number;
	preText?: string;
	previewHours?: number;
}

const props = withDefaults(defineProps<Props>(), {
	checkInterval: 1000,
	previewHours: 0,
});

const componentId = useId();
const isMounted = ref(false);
const now = ref(new Date(0));
let timer: ReturnType<typeof setInterval> | null = null;

const parseDate = (dateInput: string | Date | undefined): Date | null => {
	if (!dateInput) return null;
	let date: Date;
	if (dateInput instanceof Date) {
		date = dateInput;
	} else {
		const match = dateInput.match(
			/^(\d{2})[./-](\d{2})[./-](\d{4})(?:\s+(\d{2}):(\d{2}))?$/,
		);
		if (match) {
			const [_, day, month, year, hour, minute] = match;
			date = new Date(
				Number(year),
				Number(month) - 1,
				Number(day),
				hour ? Number(hour) : 0,
				minute ? Number(minute) : 0,
			);
		} else {
			date = new Date(dateInput);
		}
	}
	if (isNaN(date.getTime())) return null;

	if (props.timezone) {
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
		const parts = formatter.formatToParts(date);
		const getPart = (type: string) =>
			parseInt(parts.find((p) => p.type === type)?.value || "0");
		const tzDate = new Date(
			Date.UTC(
				getPart("year"),
				getPart("month") - 1,
				getPart("day"),
				getPart("hour"),
				getPart("minute"),
				getPart("second"),
			),
		);
		const diff = tzDate.getTime() - date.getTime();
		return new Date(date.getTime() - diff);
	}
	return date;
};

const resolveStatus = (current: Date): ContentStatus => {
	const startDate = parseDate(props.from);
	const endDate = parseDate(props.to);

	if (!startDate) return "active";

	let vStart = new Date(startDate);
	let vEnd = endDate ? new Date(endDate) : new Date("2099-01-01");

	if (props.repeat === "yearly") {
		vStart.setFullYear(current.getFullYear());
		vEnd.setFullYear(current.getFullYear());
		if (vEnd < vStart) vEnd.setFullYear(current.getFullYear() + 1);
	} else if (props.repeat === "daily") {
		vStart.setFullYear(
			current.getFullYear(),
			current.getMonth(),
			current.getDate(),
		);
		const duration =
			(endDate ? endDate.getTime() : 0) - startDate.getTime();
		vEnd.setTime(vStart.getTime() + duration);
	}

	if (current >= vStart && current <= vEnd) return "active";

	if (current < vStart) {
		if (props.previewHours === 0) return "upcoming";

		const previewMs = props.previewHours * 60 * 60 * 1000;
		if (vStart.getTime() - current.getTime() <= previewMs) {
			return "upcoming";
		}
	}

	return "hidden";
};

const hydrationStatus = useState<ContentStatus>(
	`scheduled-content:${componentId}`,
	() => resolveStatus(new Date()),
);

const status = computed(() =>
	isMounted.value ? resolveStatus(now.value) : hydrationStatus.value,
);

onMounted(() => {
	now.value = new Date();
	isMounted.value = true;

	timer = setInterval(() => {
		now.value = new Date();
	}, props.checkInterval);
});

onBeforeUnmount(() => {
	if (timer) clearInterval(timer);
});
</script>
