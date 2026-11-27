<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		from?: string;
		to?: string;
		min?: string;
		max?: string;
		disabled?: boolean;
		allowPartial?: boolean;
		title?: string;
		placeholder?: string;
		fromLabel?: string;
		toLabel?: string;
		applyLabel?: string;
		resetLabel?: string;
		invalidLabel?: string;
		locale?: string;
	}>(),
	{ from: "", to: "", allowPartial: false },
);
const emit = defineEmits<{
	"update:from": [value: string];
	"update:to": [value: string];
	apply: [value: { from: string; to: string }];
	reset: [];
}>();
const { t } = useMultiLang("reusable-ui");
const settings = useSettingsStore();
const open = ref(false);
const draftFrom = ref("");
const draftTo = ref("");
const invalid = ref(false);
const uid = useId();
const caption = computed(() => {
	const format = new Intl.DateTimeFormat(
		props.locale || settings.currentLocale,
		{ dateStyle: "medium", timeZone: "UTC" },
	);
	return (
		[props.from, props.to]
			.filter((value) => isUiDate(value))
			.map((value) => format.format(new Date(`${value}T12:00:00Z`)))
			.join(" – ") ||
		props.placeholder ||
		t("reusable-ui.dates")
	);
});
function edit() {
	draftFrom.value = props.from;
	draftTo.value = props.to;
	invalid.value = false;
	open.value = true;
}
function commit(from: string, to: string) {
	emit("update:from", from);
	emit("update:to", to);
	emit("apply", { from, to });
	open.value = false;
}
function apply() {
	const from = draftFrom.value;
	const to = draftTo.value;
	const withinBounds = (value: string) =>
		isUiDate(value) &&
		(!props.min || value >= props.min) &&
		(!props.max || value <= props.max);
	invalid.value =
		(!!from && !withinBounds(from)) ||
		(!!to && !withinBounds(to)) ||
		(!!from && !!to && from > to) ||
		(!props.allowPartial && !!from !== !!to);
	if (!invalid.value) commit(from, to);
}
function reset() {
	commit("", "");
	emit("reset");
}
</script>

<template>
	<div class="ui-date-range">
		<UiButton
			type="button"
			variant="outline"
			leading-icon="lucide:calendar-days"
			:disabled="disabled"
			:label="caption"
			aria-haspopup="dialog"
			:aria-expanded="open"
			@click="edit"
		/>
		<UiModal v-model="open" :title="title || t('reusable-ui.dates')">
			<form :id="uid" class="date-fields" @submit.prevent="apply">
				<UiInput
					:id="`${uid}-from`"
					v-model="draftFrom"
					type="date"
					:label="fromLabel || t('reusable-ui.fromDate')"
					:min="min"
					:max="draftTo || max"
					:aria-invalid="invalid || undefined"
					:aria-describedby="invalid ? `${uid}-error` : undefined"
				/>
				<UiInput
					:id="`${uid}-to`"
					v-model="draftTo"
					type="date"
					:label="toLabel || t('reusable-ui.toDate')"
					:min="draftFrom || min"
					:max="max"
					:aria-invalid="invalid || undefined"
					:aria-describedby="invalid ? `${uid}-error` : undefined"
				/>
				<p v-if="invalid" :id="`${uid}-error`" role="alert">
					{{ invalidLabel || t("reusable-ui.invalidRange") }}
				</p>
			</form>
			<template #footer>
				<UiButton
					type="button"
					variant="ghost"
					:label="resetLabel || t('reusable-ui.reset')"
					@click="reset"
				/>
				<UiButton
					type="submit"
					:form="uid"
					:label="applyLabel || t('reusable-ui.apply')"
				/>
			</template>
		</UiModal>
	</div>
</template>

<style scoped>
.date-fields {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding-top: 0.5rem;
}
.ui-date-range {
	min-width: 0;
}
.ui-date-range > :deep(button) {
	white-space: normal;
	text-align: start;
}
</style>
