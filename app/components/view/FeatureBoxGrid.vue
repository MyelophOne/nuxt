<script setup lang="ts">
import { NuxtLink } from "#components";

interface FeatureItem {
	icon?: string;
	title?: string;
	subtitle?: string;
	description?: string;
	to?: string;
	iconClass?: string;
}

interface Props {
	items: FeatureItem[];
	columns?: 2 | 3 | 4;
	vertical?: boolean;
	iconSize?: number;
	descAlign?: "left" | "center" | "right" | "justify";
	defaultIconClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	columns: 3,
	vertical: false,
	iconSize: 42,
	descAlign: "left",
	defaultIconClass: "text-primary",
});

const gridColsClass = computed(() => {
	switch (props.columns) {
		case 2:
			return "md:grid-cols-2";
		case 4:
			return "md:grid-cols-4";
		default:
			return "md:grid-cols-3";
	}
});

const shadowStyles = `
  shadow-[0px_0px_30px_0px_rgba(0,0,0,0.05)]
  hover:shadow-[0px_0px_30px_0px_rgba(0,0,0,0.15)]
  dark:shadow-none
  dark:hover:shadow-[0px_0px_15px_0px_rgba(255,255,255,0.05)]
  transition-all duration-300 ease-linear
`;

const cardClass = `
  relative flex flex-col h-full
  bg-white dark:bg-neutral-900
  rounded-xl border border-transparent dark:border-neutral-800
  overflow-hidden
  ${shadowStyles}
`;

const descAlignClass = computed(() => {
	switch (props.descAlign) {
		case "center":
			return "text-center";
		case "right":
			return "text-right";
		case "justify":
			return "text-justify";
		default:
			return "text-left";
	}
});
</script>

<template>
	<div class="w-full">
		<div class="grid grid-cols-1 gap-6" :class="gridColsClass">
			<component
				:is="item.to ? NuxtLink : 'div'"
				v-for="(item, index) in items"
				:key="index"
				:to="item.to"
				:class="cardClass"
				class="group p-6"
			>
				<div
					v-if="item.icon || item.title"
					class="w-full"
					:class="
						vertical
							? 'flex flex-col items-center text-center gap-3'
							: 'grid grid-cols-[auto_1fr] items-center gap-4 text-left'
					"
				>
					<div
						v-if="item.icon"
						class="flex items-center justify-center leading-none"
						:class="item.iconClass || defaultIconClass"
						:style="{
							width: vertical ? 'auto' : `${iconSize}px`,
							height: `${iconSize}px`,
						}"
					>
						<UiIcon
							:name="item.icon"
							:size="iconSize"
							class="block"
						/>
					</div>

					<div
						v-if="item.title"
						class="flex flex-col justify-center min-w-0"
						:class="vertical ? 'items-center' : 'items-start'"
					>
						<p
							class="text-lg font-semibold text-neutral-900 dark:text-white leading-none pb-0.5"
						>
							{{ item.title }}
						</p>

						<p
							v-if="item.subtitle"
							class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-none font-medium"
						>
							{{ item.subtitle }}
						</p>
					</div>
				</div>

				<hr
					v-if="(item.icon || item.title) && item.description"
					class="w-[80%] mx-auto my-5 border-t border-neutral-100 dark:border-neutral-800 group-hover:border-neutral-200 dark:group-hover:border-neutral-700 transition-colors duration-300"
				/>

				<div
					v-if="item.description"
					class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed grow"
					:class="descAlignClass"
				>
					{{ item.description }}
				</div>
			</component>
		</div>
	</div>
</template>
