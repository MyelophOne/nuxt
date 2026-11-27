<script setup lang="ts">
const props = defineProps<{
	items: ValueListItem[];
	label?: string;
	locale?: string;
	emptyLabel?: string;
}>();
const settings = useSettingsStore();
const { t } = useMultiLang("reusable-ui");
const format = (value: string | number) =>
	typeof value === "number"
		? new Intl.NumberFormat(props.locale || settings.currentLocale).format(
				value,
			)
		: value;
</script>

<template>
	<dl v-if="items.length" class="view-value-list" :aria-label="label">
		<div v-for="item in items" :key="item.id">
			<dt>
				<slot name="label" :item="item">{{ item.label }}</slot>
			</dt>
			<dd>
				<slot
					name="value"
					:item="item"
					:formatted="format(item.value)"
					>{{ format(item.value) }}</slot
				>
			</dd>
		</div>
	</dl>
	<p v-else class="view-value-list-empty">
		<slot name="empty">{{ emptyLabel || t("reusable-ui.empty") }}</slot>
	</p>
</template>

<style scoped>
.view-value-list {
	margin: 0;
}
.view-value-list > div {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	gap: 1rem;
	padding-block: 0.75rem;
	border-bottom: 1px solid var(--ui-border, currentColor);
}
.view-value-list > div:last-child {
	border-bottom: 0;
}
dt {
	min-width: 0;
	overflow-wrap: anywhere;
}
dd {
	margin: 0;
	text-align: end;
	overflow-wrap: anywhere;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
}
</style>
