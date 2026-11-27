<template>
	<div
		ref="selectWrapper"
		class="ui-currency-select"
		:class="[
			containerClass,
			{
				'is-open': isOpen,
				'drop-up': isDropUp,
				'drop-right': isDropRight,
			},
		]"
		@mousedown.stop
		@keydown.esc.stop.prevent="close(true)"
	>
		<button
			ref="trigger"
			type="button"
			class="currency-trigger"
			:class="triggerClass"
			@click.stop="toggleDropdown"
			:disabled="disabled"
			:aria-label="label || t('reusable-ui.currency')"
			:aria-expanded="isOpen"
			:aria-controls="uid"
		>
			<slot name="trigger" :currency="currentCurrency" :open="isOpen">
				<span class="currency-content">
					<span class="currency-symbol">{{
						getSymbol(currentCurrency)
					}}</span>
					<span class="currency-code">{{ currentCurrency }}</span>
				</span>
			</slot>
			<span class="currency-arrow"></span>
		</button>

		<div
			v-if="isOpen"
			:id="uid"
			class="currency-dropdown"
			:class="dropdownClass"
		>
			<div class="currency-dropdown-scroll">
				<button
					v-for="c in availableCurrencies"
					:key="c"
					type="button"
					class="currency-option"
					:class="[
						optionClass,
						{ 'is-selected': currentCurrency === c },
					]"
					@click="selectCurrency(c)"
					:aria-pressed="currentCurrency === c"
				>
					<span class="currency-symbol-mini">{{ getSymbol(c) }}</span>
					<span class="currency-code">{{ c }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	modelValue?: string;
	currencies?: string[];
	label?: string;
	disabled?: boolean;
	containerClass?: string;
	triggerClass?: string;
	dropdownClass?: string;
	optionClass?: string;
}>();
const emit = defineEmits<{
	"update:modelValue": [value: string];
	change: [value: string];
}>();
const { t } = useMultiLang("reusable-ui");
const uid = useId();
const trigger = ref<HTMLButtonElement | null>(null);
const pinia = useNuxtApp().$pinia;
const cart = props.modelValue === undefined ? useCartStore(pinia) : undefined;
const currentCurrency = computed(
	() => props.modelValue ?? cart?.currency ?? "",
);

const currencySymbols: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	CHF: "₣",
	CNY: "¥",
	RUB: "₽",
	PLN: "zł",
	UAH: "₴",
	KZT: "₸",
	BYN: "Br",
	CZK: "Kč",
	HUF: "Ft",
	RON: "L",
	TRY: "₺",
	AED: "د.إ",
	ILS: "₪",
	CAD: "C$",
	AUD: "A$",
	INR: "₹",
	KRW: "₩",
	BRL: "R$",
	THB: "฿",
	GEL: "₾",
	AMD: "֏",
};

const getSymbol = (code: string) => currencySymbols[code] || "";

const availableCurrencies = computed(() => [
	...new Set(props.currencies ?? Object.keys(cart?.exchangeRates || {})),
]);

const isOpen = ref(false);
const isDropUp = ref(false);
const isDropRight = ref(false);
const selectWrapper = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
	if (props.disabled) return;
	if (!isOpen.value) checkPosition();
	isOpen.value = !isOpen.value;
};

const checkPosition = () => {
	if (!selectWrapper.value) return;
	const rect = selectWrapper.value.getBoundingClientRect();
	isDropUp.value = window.innerHeight - rect.bottom < 200;
	isDropRight.value = window.innerWidth - rect.left < 150;
};

const selectCurrency = (currency: string) => {
	if (props.disabled) return;
	if (props.modelValue === undefined) cart?.setCurrency(currency);
	emit("update:modelValue", currency);
	emit("change", currency);
	close(true);
};

const close = (restoreFocus = false) => {
	isOpen.value = false;
	if (restoreFocus) trigger.value?.focus({ preventScroll: true });
};
const onOutsideClick = (event: MouseEvent) => {
	if (!selectWrapper.value?.contains(event.target as Node)) close();
};
const onResize = () => close();
watch(
	() => props.disabled,
	(value) => {
		if (value) close();
	},
);

onMounted(() => {
	window.addEventListener("click", onOutsideClick);
	window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
	window.removeEventListener("click", onOutsideClick);
	window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.ui-currency-select {
	position: relative;
	display: inline-block;
	--bg: var(--ui-bg);
	--brd: var(--ui-border);
	--txt: var(--ui-text);
	--ui-hover: rgba(128, 128, 128, 0.1);
	min-width: 6rem;
}

.currency-trigger {
	cursor: pointer;
	background: var(--bg);
	border: 1px solid var(--brd);
	color: var(--txt);
	padding: 8px 14px;
	display: flex;
	align-items: center;
	gap: 10px;
	text-transform: uppercase;
	font-family: inherit;
	transition: background 0.2s;
	min-width: 6rem;
}

.currency-content {
	display: flex;
	gap: 6px;
	align-items: center;
}

.currency-code,
.currency-symbol,
.currency-symbol-mini {
	font-size: 1rem;
	line-height: 1;
	font-weight: 400;
}

.currency-symbol {
	opacity: 0.6;
}

.currency-symbol-mini {
	width: 20px;
	display: inline-block;
	opacity: 0.5;
}

.currency-trigger:hover {
	background: var(--ui-hover);
}

.currency-arrow {
	width: 6px;
	height: 6px;
	border-right: 1px solid var(--txt);
	border-bottom: 1px solid var(--txt);
	transform: rotate(45deg) translateY(-2px);
	opacity: 0.6;
}

.is-open .currency-arrow {
	transform: rotate(-135deg) translateY(1px);
}

.currency-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	z-index: 1000;
	background: var(--bg);
	border: 1px solid var(--brd);
	min-width: 100%;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.drop-right .currency-dropdown {
	left: auto;
	right: 0;
}
.drop-up .currency-dropdown {
	top: auto;
	bottom: calc(100% + 4px);
}

.currency-option {
	width: 100%;
	padding: 12px 14px;
	border: none;
	background: transparent;
	color: var(--txt);
	text-align: left;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	text-transform: uppercase;
	transition:
		background 0.2s,
		color 0.2s;
}

.currency-option:hover {
	background: var(--ui-hover);
}

.currency-trigger:focus-visible,
.currency-option:focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}
.currency-trigger:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}
@media (prefers-reduced-motion: reduce) {
	.currency-trigger,
	.currency-option {
		transition: none;
	}
}

.currency-option.is-selected {
	background: var(--txt);
	color: var(--bg);
}

.currency-option.is-selected .currency-symbol-mini {
	opacity: 1;
	color: inherit;
}

@media (prefers-color-scheme: light) {
	.ui-currency-select {
		--ui-hover: rgba(0, 0, 0, 0.05);
	}
}
</style>
