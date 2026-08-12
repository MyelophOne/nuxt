<template>
	<fieldset>
		<legend class="sr-only">{{ legend || "Checkboxes" }}</legend>

		<div :class="containerClasses">
			<div :class="wrapperClasses">
				<label
					v-for="option in options"
					:key="option.value"
					:for="getInputId(option.value)"
					class="flex w-full cursor-pointer items-start gap-3 py-3 select-none"
				>
					<input
						:id="getInputId(option.value)"
						type="checkbox"
						:value="option.value"
						:checked="model.includes(option.value)"
						:disabled="option.disabled || disabled"
						@change="toggle(option.value)"
						class="sr-only peer"
					/>

					<div
						class="relative flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-200"
						:class="[
							'peer-checked:bg-blue-600 peer-checked:border-blue-600',
							'peer-disabled:opacity-60 peer-disabled:cursor-not-allowed',
							'border-gray-300 dark:border-gray-600',
							'bg-(--ui-bg) mt-0.5',
						]"
					>
						<svg
							class="size-3.5 text-white transition-transform duration-200 origin-center"
							:class="
								model.includes(option.value)
									? 'scale-100'
									: 'scale-0'
							"
							viewBox="0 0 16 16"
							fill="currentColor"
						>
							<path
								d="M13.78 3.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06L6 10.44l7-7a.75.75 0 0 1 1.06 0z"
							/>
						</svg>
					</div>

					<div class="flex-1">
						<span
							class="font-medium"
							:style="{ color: 'var(--ui-text)' }"
						>
							{{ option.label }}
						</span>
						<p
							v-if="option.description"
							class="mt-0.5 text-sm opacity-70"
							:style="{ color: 'var(--ui-text)' }"
						>
							{{ option.description }}
						</p>
					</div>
				</label>
			</div>
		</div>
	</fieldset>
</template>

<script setup lang="ts">
interface CheckboxOption {
	label: string;
	value: string | number;
	description?: string;
	disabled?: boolean;
}

const props = defineProps({
	modelValue: {
		type: Array as () => (string | number)[],
		default: () => [],
	},
	options: {
		type: Array as () => CheckboxOption[],
		required: true,
	},
	legend: String,
	disabled: Boolean,
	divider: { type: Boolean, default: false },
});

const emit = defineEmits<{
	(e: "update:modelValue", value: (string | number)[]): void;
}>();

const idMap = ref<Map<string | number, string>>(new Map());
let counter = 0;

onMounted(() => {
	props.options.forEach((opt) => {
		if (!idMap.value.has(opt.value)) {
			idMap.value.set(opt.value, `cb-${++counter}`);
		}
	});
});

const getInputId = (value: string | number): string => {
	return idMap.value.get(value) || `cb-${value}`;
};

const model = computed<(string | number)[]>({
	get: () => props.modelValue,
	set: (val) => emit("update:modelValue", val),
});

const toggle = (value: string | number) => {
	const current = [...model.value];
	const index = current.indexOf(value);
	if (index > -1) {
		current.splice(index, 1);
	} else {
		current.push(value);
	}
	emit("update:modelValue", current);
};

const containerClasses = computed(() =>
	props.divider ? "flow-root" : "space-y-3",
);

const wrapperClasses = computed(() => {
	if (!props.divider) return "";
	return "w-full divide-y divide-gray-300 dark:divide-gray-700";
});
</script>
