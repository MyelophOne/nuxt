<script
	setup
	lang="ts"
	generic="
		T extends Record<
			string,
			string | number | boolean | null | (string | number)[]
		>
	"
>
const props = defineProps<{
	modelValue: T;
	defaults: T;
	title?: string;
	label?: string;
	applyLabel?: string;
	resetLabel?: string;
	disabled?: boolean;
}>();
const emit = defineEmits<{
	"update:modelValue": [value: T];
	apply: [value: T];
	reset: [value: T];
}>();
const { t } = useMultiLang("reusable-ui");
const open = ref(false);
const draft = shallowRef<T>(copy(props.modelValue));
const uid = useId();

function copy(value: T): T {
	return Object.fromEntries(
		Object.entries(value).map(([key, item]) => [
			key,
			Array.isArray(item) ? [...item] : item,
		]),
	) as T;
}
function set<K extends keyof T>(key: K, value: T[K]) {
	draft.value = { ...draft.value, [key]: value };
}
function edit() {
	draft.value = copy(props.modelValue);
	open.value = true;
}
function apply() {
	const value = copy(draft.value);
	emit("update:modelValue", value);
	emit("apply", value);
	open.value = false;
}
function reset() {
	const value = copy(props.defaults);
	draft.value = copy(value);
	emit("update:modelValue", value);
	emit("reset", value);
	open.value = false;
}
</script>

<template>
	<div class="view-filter-dialog">
		<UiButton
			type="button"
			variant="outline"
			leading-icon="lucide:sliders-horizontal"
			:label="label || title || t('reusable-ui.filters')"
			:disabled="disabled"
			aria-haspopup="dialog"
			:aria-expanded="open"
			@click="edit"
		/>
		<UiModal
			v-model="open"
			:title="title || t('reusable-ui.filters')"
			width="max-w-2xl"
		>
			<form :id="uid" @submit.prevent="apply">
				<slot :draft="draft" :set="set" />
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
