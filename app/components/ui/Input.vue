<script setup lang="ts">
const props = defineProps({
	modelValue: [String, Number],
	id: {
		type: String,
		default: undefined,
	},
	type: {
		type: String,
		default: "text",
	},
	label: String,
	placeholder: {
		type: String,
		default: " ",
	},
	icon: String,
	iconPosition: {
		type: String as () => "start" | "end",
		default: "end",
	},
	disabled: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const generatedId = ref<string | undefined>(undefined);

onMounted(() => {
	if (!props.id && !generatedId.value) {
		generatedId.value = `input-${Math.random().toString(36).slice(2)}`;
	}
});

const inputId = computed(() => props.id || generatedId.value);

const hasValue = computed(
	() => props.modelValue != null && props.modelValue !== "",
);

const iconClasses = computed(
	() =>
		`absolute inset-y-0 top-[-8px] ${
			props.iconPosition === "start" ? "left-0 pl-3" : "right-0 pr-3"
		} flex items-center text-[var(--ui-text)]`,
);

const inputPadding = computed(() => {
	if (!props.icon) return "px-3";
	return props.iconPosition === "start" ? "ps-9 pe-3" : "ps-3 pe-9";
});
</script>

<template>
	<label :for="inputId" class="relative block">
		<input
			:id="inputId"
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			@input="
				emit(
					'update:modelValue',
					($event.target as HTMLInputElement).value,
				)
			"
			class="peer w-full h-11 rounded-md border bg-(--ui-bg) text-(--ui-text) transition-all sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed mb-2 leading-6 pt-2.5 pb-2.5"
			:class="inputPadding"
		/>

		<span
			v-if="label"
			class="absolute top-3 left-3 text-(--ui-text) text-sm font-medium bg-(--ui-bg) px-2 transition-all duration-150 peer-focus:-translate-y-5 peer-focus:scale-[0.85] peer-focus:text-blue-600 peer-focus:px-2 peer-focus:left-3 dark:peer-focus:text-blue-400 cursor-text leading-[1.1rem]"
			:class="{
				'-translate-y-5 scale-[0.85] text-blue-600 dark:text-blue-400 px-2 left-3':
					hasValue,
				'ps-9': icon && iconPosition === 'start' && !hasValue,
			}"
		>
			{{ label }}
		</span>

		<span v-if="icon" :class="iconClasses">
			<UiIcon :name="icon" class="w-4 h-4" />
		</span>
	</label>
</template>
