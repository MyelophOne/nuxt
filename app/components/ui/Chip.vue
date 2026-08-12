<script setup lang="ts">
type ChipPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface Props {
	text?: string | number;
	color?: "primary" | "red" | "green" | "blue" | "gray" | "neutral";
	size?: "xs" | "sm" | "md" | "lg";
	position?: ChipPosition;
	inset?: boolean;
	standalone?: boolean;
	show?: boolean;
	ping?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	color: "primary",
	size: "sm",
	position: "top-right",
	show: true,
	ping: false,
});

const positionClasses: Record<ChipPosition, string> = {
	"top-right": "top-0 right-0 -translate-y-1/2 translate-x-1/2",
	"top-left": "top-0 left-0 -translate-y-1/2 -translate-x-1/2",
	"bottom-right": "bottom-0 right-0 translate-y-1/2 translate-x-1/2",
	"bottom-left": "bottom-0 left-0 translate-y-1/2 -translate-x-1/2",
};

const insetClasses: Record<ChipPosition, string> = {
	"top-right": "top-0 right-0",
	"top-left": "top-0 left-0",
	"bottom-right": "bottom-0 right-0",
	"bottom-left": "bottom-0 left-0",
};

const sizeClasses = {
	xs: "h-1.5 w-1.5 text-[8px]",
	sm: "h-2.5 w-2.5 text-[9px]",
	md: "h-4 w-4 text-[10px]",
	lg: "h-5 w-5 text-[11px]",
};

const textClasses = {
	xs: "text-[8px]",
	sm: "text-[9px]",
	md: "text-[10px]",
	lg: "text-[11px]",
};

const colorClasses = {
	primary: "bg-primary-500 ring-white dark:ring-gray-900 shadow-sm",
	red: "bg-red-500 ring-white dark:ring-gray-900 shadow-sm",
	green: "bg-green-500 ring-white dark:ring-gray-900 shadow-sm",
	blue: "bg-blue-500 ring-white dark:ring-gray-900 shadow-sm",
	gray: "bg-gray-500 ring-white dark:ring-gray-900 shadow-sm",
	neutral: "bg-slate-500 ring-white dark:ring-gray-900 shadow-sm",
};

const isLongText = computed(() => String(props.text ?? "").length > 2);
</script>

<template>
	<span
		:class="[
			standalone ? 'inline-flex align-middle' : 'relative inline-flex',
		]"
	>
		<slot /><Transition
			enter-active-class="transition duration-150 ease-out"
			enter-from-class="scale-0 opacity-0"
			enter-to-class="scale-100 opacity-100"
			leave-active-class="transition duration-100 ease-in"
			leave-from-class="scale-100 opacity-100"
			leave-to-class="scale-0 opacity-0"
			><span
				v-if="show"
				:class="[
					'rounded-full flex items-center justify-center whitespace-nowrap z-10 shrink-0 leading-0! tracking-tighter font-medium text-white',
					!standalone ? 'absolute ring-1' : 'relative mx-1.5',
					!standalone &&
						(inset
							? insetClasses[position]
							: positionClasses[position]),
					sizeClasses[size],
					colorClasses[color],
					isLongText ? 'w-auto px-1.5' : 'aspect-square',
				]"
			>
				<span
					v-if="ping"
					class="chip-ping-element"
					:class="colorClasses[color].split(' ')[0]"
				/>

				<span
					class="relative z-20 flex items-center justify-center"
					:class="textClasses[size]"
				>
					<slot name="content">{{ text }}</slot>
				</span>
			</span></Transition
		></span
	>
</template>

<style scoped>
span {
	line-height: 1;
}

.chip-ping-element {
	position: absolute;
	inset: 0;
	border-radius: 9999px;
	animation: custom-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
	z-index: -1;
	pointer-events: none;
}

@keyframes custom-ping {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}
	70%,
	100% {
		transform: scale(2.5);
		opacity: 0;
	}
}

.ring-1 {
	box-shadow: 0 0 0 1px var(--tw-ring-color);
}
</style>
