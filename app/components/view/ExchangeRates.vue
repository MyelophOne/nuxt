<script setup lang="ts">
import type { ExchangeRateItem } from "../../types/reusable-ui";
const props = withDefaults(
	defineProps<{
		items: ExchangeRateItem[];
		base: string;
		label?: string;
		locale?: string;
		sourceLabel?: string;
		sourceUrl?: string;
		fractionDigits?: number;
		emptyLabel?: string;
	}>(),
	{ fractionDigits: 4 },
);
const settings = useSettingsStore();
const { t } = useMultiLang("reusable-ui");
const items = computed(() =>
	props.items.filter(
		(item) =>
			Number.isFinite(item.rate) &&
			item.rate > 0 &&
			(item.scale === undefined ||
				(Number.isFinite(item.scale) && item.scale > 0)),
	),
);
const digits = computed(() =>
	Number.isFinite(props.fractionDigits)
		? Math.max(0, Math.min(20, Math.trunc(props.fractionDigits)))
		: 4,
);
const format = (value: number) =>
	new Intl.NumberFormat(props.locale || settings.currentLocale, {
		minimumFractionDigits: digits.value,
		maximumFractionDigits: digits.value,
	}).format(value);
const source = computed(() => {
	try {
		const url = new URL(props.sourceUrl || "");
		return url.protocol === "https:" && !url.username && !url.password
			? url.href
			: "";
	} catch {
		return "";
	}
});
</script>

<template>
	<div
		class="view-exchange-rates"
		:aria-label="label || t('reusable-ui.rates')"
	>
		<a
			v-if="source && sourceLabel"
			:href="source"
			target="_blank"
			rel="noopener noreferrer"
			>{{ sourceLabel }}</a
		>
		<span v-else-if="sourceLabel">{{ sourceLabel }}</span>
		<dl v-if="items.length">
			<div v-for="item in items" :key="item.code">
				<dt>{{ item.scale ?? 1 }} {{ item.code }}</dt>
				<dd>
					<strong>{{ format(item.rate) }}</strong> {{ base
					}}<time
						v-if="item.date && isUiDate(item.date)"
						:datetime="item.date"
						>{{
							new Intl.DateTimeFormat(
								locale || settings.currentLocale,
								{ dateStyle: "medium", timeZone: "UTC" },
							).format(new Date(item.date + "T12:00:00Z"))
						}}</time
					>
				</dd>
			</div>
		</dl>
		<p v-else>{{ emptyLabel || t("reusable-ui.empty") }}</p>
	</div>
</template>

<style scoped>
.view-exchange-rates,
dl {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: baseline;
}
dl,
dd {
	margin: 0;
}
dl > div {
	display: flex;
	gap: 0.5rem;
	align-items: baseline;
	flex-wrap: wrap;
}
dd {
	font-variant-numeric: tabular-nums;
}
time {
	display: block;
	font-size: 0.8em;
}
a {
	text-decoration: underline;
	text-underline-offset: 0.2em;
}
</style>
