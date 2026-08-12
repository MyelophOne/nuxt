<template>
	<section class="w-full py-12 md:py-24 overflow-hidden">
		<div v-if="title" class="text-center mb-16 md:mb-24 px-4">
			<p
				class="text-xs font-bold uppercase tracking-[0.25em] text-(--ui-text) opacity-40"
			>
				{{ title }}
			</p>
		</div>

		<div v-if="items && items.length > 0">
			<div
				class="flex flex-wrap justify-center items-center -mx-2 md:-mx-4 lg:-mx-6"
			>
				<component
					:is="logo.link ? 'NuxtLink' : 'div'"
					v-for="(logo, index) in items"
					:key="index"
					:to="logo.link"
					:target="
						logo.link && logo.link.startsWith('http')
							? '_blank'
							: undefined
					"
					class="relative flex items-center justify-center select-none group transition-transform duration-300"
					:class="[
						index >= safeMobileLimit ? 'hidden md:flex' : 'flex',
						mobileLimit === 3 ? 'w-1/3 px-2' : 'w-1/2 px-2',
						'sm:w-1/3 sm:px-4',
						'md:w-1/4 md:px-4',
						'lg:w-1/6 lg:px-6',
						'xl:w-[14.28%] xl:px-6',
						'2xl:w-[12.5%] 2xl:px-6',
						'py-8 md:py-12',

						logo.link ? 'cursor-pointer' : 'cursor-default',
					]"
				>
					<img
						:src="logo.src"
						:alt="logo.alt || 'Logo'"
						class="h-7 md:h-12 w-full object-contain transition-all duration-700 ease-in-out logoimg"
						:class="[
							getVariantClasses,
							{ 'dark:invert': logo.dark },
						]"
						loading="lazy"
					/>
				</component>

				<div
					v-if="showMoreCount && items.length > safeMobileLimit"
					class="md:hidden flex w-full items-center justify-center mt-8"
				>
					<div
						class="h-8 flex items-center justify-center text-[10px] font-bold text-(--ui-text) opacity-40 border border-(--ui-text)/20 rounded-full px-4 whitespace-nowrap"
					>
						+{{ items.length - safeMobileLimit }}
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface LogoItem {
	src: string;
	alt?: string;
	link?: string;
	dark?: boolean;
}

interface Props {
	items?: LogoItem[];
	title?: string;
	variant?: "gray-hover" | "color" | "gray";
	mobileLimit?: number;
	showMoreCount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	items: () => [],
	title: "",
	variant: "gray-hover",
	mobileLimit: 6,
	showMoreCount: false,
});

const safeMobileLimit = computed(() => Math.max(0, props.mobileLimit));

const getVariantClasses = computed(() => {
	switch (props.variant) {
		case "gray-hover":
			return "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100";
		case "color":
			return "grayscale-0 opacity-60 group-hover:opacity-100";
		case "gray":
			return "grayscale opacity-40 group-hover:opacity-80";
		default:
			return "";
	}
});
</script>
