<script setup lang="ts">
const props = defineProps<{
	label: string;
	value: number | string;
	icon?: string;
	description?: string;
	locale?: string;
}>();
const settings = useSettingsStore();
const formatted = computed(() =>
	typeof props.value === "number"
		? new Intl.NumberFormat(props.locale || settings.currentLocale).format(
				props.value,
			)
		: props.value,
);
</script>

<template>
	<UiCard class="view-metric-card">
		<slot name="icon"
			><UiIcon v-if="icon" :name="icon" size="24" aria-hidden="true"
		/></slot>
		<dl>
			<dt>{{ label }}</dt>
			<dd>
				<slot :value="value" :formatted="formatted">{{
					formatted
				}}</slot>
			</dd>
		</dl>
		<p v-if="description">{{ description }}</p>
		<slot name="footer" />
	</UiCard>
</template>

<style scoped>
.view-metric-card {
	height: 100%;
	min-width: 0;
}
dl {
	margin: 0;
}
dt {
	margin-block: 0.75rem;
	overflow-wrap: anywhere;
}
dd {
	margin: 0;
	font-size: var(--metric-size, clamp(1.75rem, 1.4rem + 1vw, 3rem));
	font-weight: 600;
	line-height: 1.15;
	font-variant-numeric: tabular-nums;
	overflow-wrap: anywhere;
}
p {
	margin-top: 0.75rem;
	font-size: 0.875em;
}
</style>
