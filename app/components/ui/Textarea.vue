<template>
	<div>
		<label
			v-if="label"
			:for="id"
			class="block text-sm font-medium mb-1"
			:style="{ color: 'var(--ui-text)' }"
		>
			{{ label }}
		</label>

		<div
			v-if="buttonsPosition === 'inside'"
			class="relative rounded-md border transition-all peer"
			:class="containerClasses"
			@focusin="isFocused = true"
			@focusout="isFocused = false"
		>
			<textarea
				:id="id"
				ref="textarea"
				v-model="internalValue"
				:rows="rows"
				:placeholder="placeholder"
				:class="insideTextareaClasses"
				v-bind="$attrs"
				@input="$emit('update:modelValue', $event.target.value)"
			/>

			<div class="flex items-center justify-end gap-2 p-1.5">
				<slot name="buttons">
					<button
						v-if="showClear"
						type="button"
						:class="clearButtonClasses"
						@click="clear"
					>
						{{ clearText }}
					</button>

					<button
						v-if="showSave"
						type="button"
						:class="saveButtonClasses"
						@click="$emit('save', internalValue)"
					>
						{{ saveText }}
					</button>
				</slot>
			</div>
		</div>

		<div v-else>
			<textarea
				:id="id"
				ref="textarea"
				v-model="internalValue"
				:rows="rows"
				:placeholder="placeholder"
				:class="outsideTextareaClasses"
				v-bind="$attrs"
				@input="$emit('update:modelValue', $event.target.value)"
			/>

			<div
				v-if="buttonsPosition === 'outside' && hasButtons"
				class="mt-2 flex items-center justify-end gap-2"
			>
				<slot name="buttons">
					<button
						v-if="showClear"
						type="button"
						:class="clearButtonClasses"
						@click="clear"
					>
						{{ clearText }}
					</button>

					<button
						v-if="showSave"
						type="button"
						:class="saveButtonClasses"
						@click="$emit('save', internalValue)"
					>
						{{ saveText }}
					</button>
				</slot>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	modelValue: { type: String, default: "" },
	label: { type: String, default: "" },
	id: { type: String, required: true },
	rows: { type: [Number, String], default: 4 },
	placeholder: { type: String, default: "" },
	error: { type: Boolean, default: false },
	buttonsPosition: {
		type: String,
		default: "none",
		validator: (v) => ["none", "inside", "outside"].includes(v),
	},
	showClear: { type: Boolean, default: true },
	showSave: { type: Boolean, default: true },
	clearText: { type: String, default: "Clear" },
	saveText: { type: String, default: "Save" },
});

const emit = defineEmits(["update:modelValue", "save", "clear"]);

const internalValue = ref(props.modelValue);
const textarea = ref(null);
const isFocused = ref(false);

watch(
	() => props.modelValue,
	(val) => {
		internalValue.value = val;
	},
);

const clear = () => {
	internalValue.value = "";
	emit("update:modelValue", "");
	emit("clear");
	nextTick(() => textarea.value?.focus());
};

const outsideTextareaClasses = computed(() => {
	const base = [
		"peer",
		"w-full",
		"rounded-md",
		"border",
		"bg-[var(--ui-bg)]",
		"text-[var(--ui-text)]",
		"transition-all",
		"sm:text-sm",
		"disabled:opacity-60",
		"disabled:cursor-not-allowed",
		"py-2.5",
		"px-3",
		"pb-2.5",
		"focus:outline-none",
		"focus:ring-1",
		"focus:ring-blue-500",
		"dark:focus:ring-blue-400",
		"focus:border-blue-500",
		"dark:focus:border-blue-400",
	];

	if (props.error) {
		base.push(
			"border-red-500",
			"focus-within:border-blue-500",
			"dark:focus-within:border-blue-400",
			"focus-within:ring-1",
			"focus-within:ring-blue-500",
			"dark:focus-within:ring-blue-400",
		);
	}

	return base;
});

const insideTextareaClasses = computed(() => [
	"w-full",
	"resize-none",
	"bg-transparent",
	"text-[var(--ui-text)]",
	"sm:text-sm",
	"py-2.5",
	"px-3",
	"pb-2.5",
	"pr-36",
	"border-0",
	"outline-none",
	"ring-0",
	"focus:outline-none",
	"focus:ring-0",
	"focus:border-0",
	"transition-all",
]);

const containerClasses = computed(() => {
	const base = ["transition-all", "peer"];

	if (props.error) {
		base.push(
			"border-red-500",
			"focus-within:border-red-500",
			"focus-within:ring-1",
			"focus-within:ring-red-500",
		);
	} else {
		base.push(
			"focus-within:border-blue-500",
			"dark:focus-within:border-blue-400",
			"focus-within:ring-1",
			"focus-within:ring-blue-500",
			"dark:focus-within:ring-blue-400",
		);
	}

	return base;
});

const hasButtons = computed(() => {
	return props.showClear || props.showSave || !!$slots.buttons;
});

const clearButtonClasses = computed(() => [
	"rounded-md",
	"border",
	"border-transparent",
	"px-3",
	"py-1.5",
	"text-sm",
	"font-medium",
	"text-[var(--ui-text)]",
	"transition-opacity",
	"hover:opacity-80",
	"focus:outline-none",
]);

const saveButtonClasses = computed(() => [
	"rounded-md",
	"border",
	"border-gray-300",
	"dark:border-gray-600",
	"px-3",
	"py-1.5",
	"text-sm",
	"font-medium",
	"shadow-sm",
	"text-[var(--ui-text)]",
	"bg-[var(--ui-bg)]",
	"transition-opacity",
	"hover:opacity-90",
	"focus:outline-none",
]);
</script>

<style scoped>
textarea::placeholder {
	color: color-mix(in srgb, var(--ui-text), transparent 60%);
}
</style>
