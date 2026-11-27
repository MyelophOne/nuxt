<script setup lang="ts">
import type { SelectDialogOption } from "../../types/reusable-ui";
const props = withDefaults(
	defineProps<{
		modelValue?: (string | number)[];
		options: SelectDialogOption[];
		title?: string;
		placeholder?: string;
		description?: string;
		disabled?: boolean;
		applyLabel?: string;
		resetLabel?: string;
		emptyLabel?: string;
	}>(),
	{ modelValue: () => [] },
);
const emit = defineEmits<{
	"update:modelValue": [value: (string | number)[]];
	apply: [value: (string | number)[]];
	reset: [];
}>();
const { t } = useMultiLang("reusable-ui");
const open = ref(false);
const draft = ref<(string | number)[]>([]);
const caption = computed(
	() =>
		props.modelValue
			.map(
				(value) =>
					props.options.find((option) => option.value === value)
						?.label || String(value),
			)
			.join(", ") ||
		props.placeholder ||
		t("reusable-ui.choose"),
);
function edit() {
	draft.value = [...props.modelValue];
	open.value = true;
}
function commit(values: (string | number)[]) {
	const value = [...new Set(values)];
	emit("update:modelValue", value);
	emit("apply", value);
	open.value = false;
}
function reset() {
	commit([]);
	emit("reset");
}
</script>

<template>
	<div class="ui-multi-select-dialog">
		<UiButton
			type="button"
			variant="outline"
			trailing-icon="lucide:chevron-down"
			:disabled="disabled"
			:label="caption"
			aria-haspopup="dialog"
			:aria-expanded="open"
			@click="edit"
		/>
		<UiModal v-model="open" :title="title || t('reusable-ui.choose')">
			<p v-if="description">{{ description }}</p>
			<UiCheckbox
				v-if="options.length"
				v-model="draft"
				:options="options"
				:legend="title || t('reusable-ui.choose')"
			/>
			<p v-else role="status">
				{{ emptyLabel || t("reusable-ui.empty") }}
			</p>
			<template #footer>
				<UiButton
					type="button"
					variant="ghost"
					:label="resetLabel || t('reusable-ui.reset')"
					@click="reset"
				/>
				<UiButton
					type="button"
					:label="applyLabel || t('reusable-ui.apply')"
					@click="commit(draft)"
				/>
			</template>
		</UiModal>
	</div>
</template>

<style scoped>
.ui-multi-select-dialog {
	min-width: 0;
}
.ui-multi-select-dialog > :deep(button) {
	max-width: 100%;
	white-space: normal;
	text-align: start;
	overflow-wrap: anywhere;
}
</style>
