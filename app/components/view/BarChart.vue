<script setup lang="ts">
import type { BarChartItem } from "../../types/reusable-ui";
const props = withDefaults(
	defineProps<{
		items: BarChartItem[];
		label: string;
		locale?: string;
		emptyLabel?: string;
	}>(),
	{ items: () => [] },
);
const settings = useSettingsStore();
const { t } = useMultiLang("reusable-ui");
const validItems = computed(() =>
	props.items.filter(
		(item) => Number.isFinite(item.value) && item.value >= 0,
	),
);
const maximum = computed(() =>
	Math.max(1, ...validItems.value.map((item) => item.value)),
);
const format = (value: number) =>
	new Intl.NumberFormat(props.locale || settings.currentLocale).format(value);
</script>

<template>
	<figure class="view-bar-chart">
		<figcaption>{{ label }}</figcaption>
		<ol v-if="validItems.length">
			<li v-for="item in validItems" :key="item.id">
				<div class="chart-row">
					<span class="chart-label">{{ item.label }}</span><strong>{{
						format(item.value)
					}}</strong>
				</div>
				<div class="chart-track" aria-hidden="true">
					<span
						:style="{ width: `${(item.value / maximum) * 100}%` }"
					/>
				</div>
			</li>
		</ol>
		<p v-else>
			<slot name="empty">{{ emptyLabel || t("reusable-ui.empty") }}</slot>
		</p>
	</figure>
</template>

<style scoped>
.view-bar-chart {
	margin: 0;
	min-width: 0;
}
figcaption {
	font-weight: 600;
	margin-bottom: 1rem;
}
ol {
	list-style: none;
	padding: 0;
	margin: 0;
}
li + li {
	margin-top: 1rem;
}
.chart-row {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 1rem;
}
.chart-label {
	min-width: 0;
	overflow-wrap: anywhere;
}
strong {
	font-variant-numeric: tabular-nums;
}
.chart-track {
	margin-top: 0.375rem;
	height: var(--chart-bar-height, 0.625rem);
	background: color-mix(in srgb, var(--ui-text) 12%, transparent);
	border-radius: 0.25rem;
	overflow: hidden;
}
.chart-track span {
	display: block;
	height: 100%;
	background: var(--chart-color, var(--ui-text));
	border-radius: inherit;
}
</style>
