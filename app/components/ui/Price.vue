<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		amount?: number | null;
		currency?: string;
		divisor?: number;
		locale?: string;
		from?: boolean;
		approximate?: boolean;
		unit?: string;
		reference?: string;
		fromLabel?: string;
		approximateLabel?: string;
		onRequestLabel?: string;
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
	}>(),
	{ divisor: 1, currencyDisplay: "symbol" },
);
const { t } = useMultiLang("reusable-ui");
const settings = useSettingsStore();
const formatted = computed(() => {
	if (
		props.amount == null ||
		!Number.isFinite(props.amount) ||
		!props.currency ||
		!Number.isFinite(props.divisor) ||
		props.divisor <= 0
	)
		return "";
	const value = props.amount / props.divisor;
	if (!Number.isFinite(value)) return "";
	try {
		return new Intl.NumberFormat(props.locale || settings.currentLocale, {
			style: "currency",
			currency: props.currency,
			currencyDisplay: props.currencyDisplay,
			minimumFractionDigits: props.minimumFractionDigits,
			maximumFractionDigits: props.maximumFractionDigits,
		}).format(value);
	} catch {
		return "";
	}
});
</script>

<template>
	<span class="ui-price">
		<template v-if="formatted">
			<span v-if="from" class="price-prefix"
				>{{ fromLabel || t("reusable-ui.fromPrice") }}
			</span>
			<span v-if="approximate" class="price-prefix"
				>{{ approximateLabel || t("reusable-ui.approximate") }}
			</span>
			<strong class="price-amount">{{ formatted }}</strong>
			<span v-if="unit" class="price-unit"> {{ unit }}</span>
			<small v-if="reference" class="price-reference">{{
				reference
			}}</small>
		</template>
		<slot v-else name="unavailable">{{
			onRequestLabel || t("reusable-ui.onRequest")
		}}</slot>
	</span>
</template>

<style scoped>
.ui-price {
	font-variant-numeric: tabular-nums;
}
.price-amount {
	font-weight: var(--price-weight, 600);
}
.price-unit,
.price-prefix {
	font-size: inherit;
}
.price-reference {
	display: block;
	font-size: 0.85em;
}
</style>
