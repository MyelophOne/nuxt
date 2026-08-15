<script setup lang="ts">
type Value = string | number;

interface Option {
	value: Value;
	label: string;
	icon?: string;
}

const props = withDefaults(
	defineProps<{
		modelValue?: Value | Value[] | null;
		options: Option[];
		multiple?: boolean;
		vertical?: boolean;
		full?: boolean;
		color?: "primary" | "gray" | "info" | "success" | "warning" | "error";
		variant?: "outline" | "soft";
		size?: "xs" | "sm" | "md" | "lg";
	}>(),
	{
		multiple: false,
		vertical: false,
		full: false,
		color: "gray",
		variant: "outline",
		size: "md",
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: Value | Value[] | null): void;
}>();

const value = computed<Value | Value[] | null>({
	get: () => props.modelValue ?? null,
	set: (v) => emit("update:modelValue", v),
});

const isActive = (v: Value) => {
	if (props.multiple) {
		return Array.isArray(value.value) && value.value.includes(v);
	}
	return value.value === v;
};

const toggle = (v: Value) => {
	if (!props.multiple) {
		value.value = v;
		return;
	}

	const arr = Array.isArray(value.value) ? [...value.value] : [];
	const i = arr.indexOf(v);

	if (i === -1) arr.push(v);
	else arr.splice(i, 1);

	value.value = arr;
};

const sizes = {
	xs: "text-xs px-2 py-1",
	sm: "text-sm px-3 py-1.5",
	md: "text-sm px-4 py-2",
	lg: "text-base px-5 py-2.5",
} as const;

const colors = {
	gray: {
		border: "border-gray-400 dark:border-gray-700",
		divider: "bg-gray-400/40 dark:bg-gray-600/40",
		hover: "hover:bg-gray-200/60 dark:hover:bg-gray-600/40",
		active: "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
	},
	primary: {
		border: "border-primary-400 dark:border-primary-500",
		divider: "bg-primary-400/40 dark:bg-primary-500/40",
		hover: "hover:bg-primary-500/10",
		active: "bg-primary-600 text-white",
	},
	success: {
		border: "border-emerald-400 dark:border-emerald-500",
		divider: "bg-emerald-400/40 dark:bg-emerald-500/40",
		hover: "hover:bg-emerald-500/10",
		active: "bg-emerald-600 text-white",
	},
	info: {
		border: "border-blue-400 dark:border-blue-500",
		divider: "bg-blue-400/40 dark:bg-blue-500/40",
		hover: "hover:bg-blue-500/10",
		active: "bg-blue-600 text-white",
	},
	warning: {
		border: "border-amber-400 dark:border-amber-500",
		divider: "bg-amber-400/40 dark:bg-amber-500/40",
		hover: "hover:bg-amber-500/10",
		active: "bg-amber-500 text-black",
	},
	error: {
		border: "border-red-400 dark:border-red-500",
		divider: "bg-red-400/40 dark:bg-red-500/40",
		hover: "hover:bg-red-500/10",
		active: "bg-red-600 text-white",
	},
} as const;

const wrapperClasses = computed(() => [
	"inline-flex rounded-md overflow-hidden border",
	colors[props.color].border,
	props.vertical ? "flex-col" : "flex-row",
	props.full ? "w-full" : "w-fit",
]);

const itemClasses = (active: boolean) => [
	"relative flex items-center justify-center gap-2 font-medium cursor-pointer select-none transition-colors",
	sizes[props.size],
	!active ? colors[props.color].hover : "",
	active ? colors[props.color].active : "",
	props.full && !props.vertical ? "flex-1" : "",
];
</script>

<template>
	<div :class="wrapperClasses" role="group">
		<div
			v-for="(opt, index) in options"
			:key="opt.value"
			:class="itemClasses(isActive(opt.value))"
			:aria-pressed="isActive(opt.value) ? 'true' : 'false'"
			@click="toggle(opt.value)"
		>
			<UiIcon v-if="opt.icon" :name="opt.icon" class="h-4 w-4" />
			<span>{{ opt.label }}</span>

			<span
				v-if="!props.vertical && index < options.length - 1"
				class="absolute right-0 top-1/2 -translate-y-1/2 w-px h-2/3 pointer-events-none"
				:class="colors[props.color].divider"
			/>
			<span
				v-if="props.vertical && index < options.length - 1"
				class="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-2/3 pointer-events-none"
				:class="colors[props.color].divider"
			/>
		</div>
	</div>
</template>
