<script setup lang="ts">
import { Fragment, isVNode } from "vue";

interface Props {
	size?: "sm" | "md" | "lg" | "xl";
	max?: number;
	class?: any;
}

const props = withDefaults(defineProps<Props>(), {
	size: "md",
	max: 7,
});

const slots = useSlots();

function flatten(nodes: any[]): any[] {
	const out: any[] = [];

	for (const n of nodes) {
		if (!n) continue;

		if (Array.isArray(n)) {
			out.push(...flatten(n));
			continue;
		}

		if (isVNode(n) && n.type === Fragment && Array.isArray(n.children)) {
			out.push(...flatten(n.children as any[]));
			continue;
		}

		if (isVNode(n) && (n.type === Text || n.type === Comment)) continue;

		out.push(n);
	}

	return out;
}

const children = computed(() => flatten(slots.default?.() ?? []));

const visibleChildren = computed(() => {
	if (!props.max) return children.value;
	return children.value.slice(0, props.max);
});

const remainingCount = computed(() => {
	return Math.max(0, children.value.length - (props.max || 0));
});

const baseItemClass =
	"relative -ml-2 ring-2 ring-white dark:ring-zinc-900 transition-transform hover:z-50";

const rendered = computed(() => {
	const list = [...visibleChildren.value].reverse();

	return list.map((child: any, index: number) => {
		if (!isVNode(child)) return child;

		const childProps = (child.props ?? {}) as Record<string, any>;

		return h(
			child.type as any,
			{
				...childProps,
				key: child.key ?? index,
				size: props.size,
				class: [baseItemClass, childProps.class],
				style: [childProps.style, { zIndex: index + 1 }],
			},
			child.children as any,
		);
	});
});
</script>

<template>
	<div
		:class="[
			'flex items-center justify-start flex-row-reverse',
			props.class,
		]"
	>
		<UiAvatar
			v-if="remainingCount > 0"
			:text="`+${remainingCount}`"
			:size="size"
			class="relative -ml-2 ring-2 ring-white dark:ring-zinc-900 z-0"
		/>

		<component
			v-for="node in rendered"
			:key="(node as any)?.key"
			:is="node"
		/>
	</div>
</template>

<style scoped>
.flex-row-reverse > *:last-child {
	margin-left: 0;
}
</style>
