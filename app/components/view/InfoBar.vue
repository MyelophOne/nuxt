<script setup lang="ts">
interface InfoItem {
	icon: string;
	label?: string | number;
	iconClass?: string;
	textClass?: string;
	action?: () => void;
}

interface ActionItem {
	icon: string;
	label?: string;
	iconClass?: string;
	action?: () => void;
}

const props = withDefaults(
	defineProps<{
		items?: InfoItem[];
		actions?: ActionItem[];
		wrapperClass?: string;
		iconSize?: string;
	}>(),
	{
		items: () => [],
		actions: () => [],
		wrapperClass: "",
	},
);

const iconFixBase = "[mask-size:100%_100%] bg-current";
</script>

<template>
	<div
		class="w-full flex flex-wrap items-center justify-between gap-y-2 gap-x-4 py-2"
		:class="wrapperClass"
	>
		<div v-if="items.length" class="flex flex-wrap items-center gap-4">
			<div
				v-for="(item, index) in items"
				:key="`info-${index}`"
				class="flex items-center gap-1.5 group select-none transition-opacity"
				:class="{ 'cursor-pointer hover:opacity-80': !!item.action }"
				@click="item.action && item.action()"
			>
				<UiIcon
					:name="item.icon"
					class="transition-transform group-active:scale-90"
					:size="`${iconSize}`"
					:class="`${iconFixBase} ${item.iconClass || 'text-gray-900 dark:text-gray-100'}`"
				/>

				<span
					v-if="item.label !== undefined"
					class="font-medium leading-none"
					:class="
						item.textClass || 'text-gray-900 dark:text-gray-100'
					"
				>
					{{ item.label }}
				</span>
			</div>
		</div>

		<div
			v-if="actions.length"
			class="flex items-center gap-3 ml-auto sm:ml-0"
		>
			<button
				v-for="(act, index) in actions"
				:key="`act-${index}`"
				type="button"
				class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
				@click="act.action && act.action()"
				:title="act.label"
			>
				<UiIcon
					:name="act.icon"
					:size="`${iconSize}`"
					:class="`${iconFixBase} ${act.iconClass || 'text-gray-900 dark:text-gray-100'}`"
				/>
			</button>
		</div>
	</div>
</template>
