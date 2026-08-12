<script setup lang="ts">
interface SocialItem {
	name: string;
	to: string;
	label: string;
	color?: string;
	target?: "_blank" | "_self";
}

type Variant = "simple" | "colored" | "circle" | "solid" | "glass";

interface Props {
	items: SocialItem[];
	variant?: Variant;
	size?: string | number;
	gap?: string;
	iconClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "simple",
	size: 24,
	gap: "gap-4",
	iconClass: "",
});

const baseLinkClass =
	"flex items-center justify-center transition-colors duration-200 social-link no-external-icon";

const variantClasses: Record<Variant, string> = {
	simple: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white p-1",
	colored: "hover:opacity-80 p-1",
	circle: `
    w-10 h-10 rounded-full border
    border-neutral-200 text-neutral-600
    hover:border-black hover:bg-black hover:text-white
    dark:border-neutral-700 dark:text-neutral-400
    dark:hover:border-white dark:hover:bg-white dark:hover:text-black
  `,
	solid: `
    w-10 h-10 rounded-full
    bg-neutral-100 text-neutral-600
    hover:bg-neutral-900 hover:text-white
    dark:bg-neutral-800 dark:text-neutral-300
    dark:hover:bg-neutral-100 dark:hover:text-black
  `,
	glass: `
    w-10 h-10 rounded-xl border
    bg-white/50 border-white/20 text-neutral-700 hover:bg-white/80
    dark:bg-white/5 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/10
  `,
};

const getLinkClass = (item: SocialItem) => {
	let cls = `${baseLinkClass} ${variantClasses[props.variant].replace(/\s+/g, " ")}`;
	if (props.variant === "colored" || props.variant === "simple") {
		if (item.color) cls += ` ${item.color}`;
	}

	return cls;
};
</script>

<template>
	<div class="flex flex-wrap items-center" :class="gap">
		<NuxtLink
			v-for="(item, index) in items"
			:key="index"
			:to="item.to"
			:target="item.target || '_blank'"
			:aria-label="item.label"
			:class="getLinkClass(item)"
			external
		>
			<UiIcon :name="item.name" :size="size" :class="`${iconClass}`" />
		</NuxtLink>
	</div>
</template>
