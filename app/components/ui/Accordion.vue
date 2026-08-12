<script setup lang="ts">
interface AccordionItem {
	label: string;
	content: string;
	defaultOpen?: boolean;
	[key: string]: any;
}

interface AccordionClasses {
	wrapper?: string;
	item?: string;
	header?: string;
	headerActive?: string;
	headerIcon?: string;
	contentWrapper?: string;
	content?: string;
}

const props = withDefaults(
	defineProps<{
		items: AccordionItem[];
		multiple?: boolean;
		faq?: boolean;
		ui?: AccordionClasses;
	}>(),
	{
		multiple: false,
		faq: false,
		ui: () => ({}),
	},
);

const openIndices = ref<number[]>(
	props.items
		.map((item, index) => (item.defaultOpen ? index : -1))
		.filter((i) => i !== -1),
);

const toggle = (index: number) => {
	if (props.multiple) {
		if (openIndices.value.includes(index)) {
			openIndices.value = openIndices.value.filter((i) => i !== index);
		} else {
			openIndices.value.push(index);
		}
	} else {
		if (openIndices.value.includes(index)) {
			openIndices.value = [];
		} else {
			openIndices.value = [index];
		}
	}
};

const isOpen = (index: number) => openIndices.value.includes(index);

if (props.faq) {
	const faqSchema = computed(() => ({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: props.items.map((item) => ({
			"@type": "Question",
			name: item.label,
			acceptedAnswer: {
				"@type": "Answer",
				text: item.content,
			},
		})),
	}));

	useHead(() => ({
		script: [
			{
				type: "application/ld+json",
				key: "faq-schema",
				innerHTML: JSON.stringify(faqSchema.value),
			},
		],
	}));
}

const layoutContentWrapper =
	"grid transition-[grid-template-rows] duration-300 ease-out";
const layoutHeader =
	"flex items-center justify-between w-full text-left cursor-pointer select-none pt-[0.8rem]";

const defaultWrapper = "space-y-4";
const defaultItem =
	"border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 overflow-hidden";
const defaultHeader =
	"p-4 font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors";
const defaultHeaderActive = "bg-neutral-50 dark:bg-neutral-800 text-primary";
const defaultIcon =
	"w-5 h-5 text-neutral-400 transition-transform duration-300";
const defaultContent =
	"p-4 text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-transparent";
</script>

<template>
	<div :class="ui.wrapper || defaultWrapper">
		<div
			v-for="(item, index) in items"
			:key="index"
			:class="ui.item || defaultItem"
		>
			<button
				type="button"
				@click="toggle(index)"
				:class="[
					layoutHeader,
					ui.header || defaultHeader,
					isOpen(index) ? ui.headerActive || defaultHeaderActive : '',
				]"
				:aria-expanded="isOpen(index)"
			>
				<slot
					name="header"
					:item="item"
					:index="index"
					:is-open="isOpen(index)"
				>
					<span>{{ item.label }}</span>
				</slot>

				<span
					:class="[
						ui.headerIcon || defaultIcon,
						isOpen(index) ? 'rotate-180' : '',
					]"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="w-full h-full"
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</span>
			</button>

			<div
				:class="[
					layoutContentWrapper,
					ui.contentWrapper,
					isOpen(index) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
				]"
			>
				<div class="overflow-hidden">
					<div :class="ui.content || defaultContent">
						<slot name="content" :item="item" :index="index">
							<div v-html="item.content" />
						</slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
