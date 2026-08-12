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
	>
		<button
			type="button"
			class="currency-trigger"
			:class="triggerClass"
			@click.stop="toggleDropdown"
		>
			<slot name="trigger">
				<span class="currency-content">
					<span class="currency-symbol">{{
						getSymbol(cart.currency)
					}}</span>
					<span class="currency-code">{{ cart.currency }}</span>
				</span>
			</slot>
			<span class="currency-arrow"></span>
		</button>

		<div v-if="isOpen" class="currency-dropdown" :class="dropdownClass">
			<div class="currency-dropdown-scroll">
				<button
					v-for="c in currencies"
					:key="c"
					type="button"
					class="currency-option"
					:class="[
						optionClass,
						{ 'is-selected': cart.currency === c },
					]"
					@click="selectCurrency(c)"
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
	containerClass?: string;
	triggerClass?: string;
	dropdownClass?: string;
	optionClass?: string;
}>();

const pinia = useNuxtApp().$pinia;
const cart = useCartStore(pinia);

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

const currencies = computed(() => Object.keys(cart.exchangeRates || {}));

const isOpen = ref(false);
const isDropUp = ref(false);
const isDropRight = ref(false);
const selectWrapper = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
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
	cart.setCurrency(currency);
	isOpen.value = false;
};

const close = () => {
	isOpen.value = false;
};

onMounted(() => {
	window.addEventListener("click", close);
	window.addEventListener("resize", close);
});

onBeforeUnmount(() => {
	window.removeEventListener("click", close);
	window.removeEventListener("resize", close);
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
	transition: all 0.2s;
}

.currency-option:hover {
	background: var(--ui-hover);
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
