<script setup lang="ts">
interface Props {
	modelValue: boolean;
	disabled?: boolean;
	label?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);

const toggle = () => {
	if (props.disabled) return;
	emit("update:modelValue", !props.modelValue);
};
</script>

<template>
	<button
		type="button"
		role="switch"
		:aria-checked="modelValue"
		:disabled="disabled"
		@click="toggle"
		class="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
		:class="[
			modelValue
				? 'bg-(--ui-text)'
				: 'bg-neutral-200 dark:bg-neutral-700',
			disabled ? 'cursor-not-allowed opacity-50' : '',
		]"
	>
		<span class="sr-only">{{ label || "Переключить" }}</span>

		<span
			aria-hidden="true"
			class="pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out bg-(--ui-bg)"
			:class="[modelValue ? 'translate-x-5' : 'translate-x-0']"
		/>
	</button>
</template>
