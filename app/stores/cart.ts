export type CartItemId = string | number;
export type CurrencyCode = Uppercase<string>;

export interface CartItem {
	id: CartItemId;
	price: number;
	quantity: number;
	name?: string;
	currency?: CurrencyCode;
	[key: string]: unknown;
}

export interface AddCartItem {
	id: CartItemId;
	price: number;
	quantity?: number;
	name?: string;
	currency?: string;
	[key: string]: unknown;
}

export interface Coupon {
	code: string;
	discountPercent?: number;
	discountAmount?: number;
	meta?: Record<string, unknown>;
}

export interface CartTotals {
	subtotal: number;
	discount: number;
	tax: number;
	shipping: number;
	total: number;
	taxes: Record<string, number>;
}

export interface CartState<TItem extends CartItem = CartItem> {
	items: TItem[];
	coupon: Coupon | null;
	meta: Record<string, unknown>;
	currency: CurrencyCode;
}

export interface CurrencyRates {
	base: CurrencyCode;
	date?: string;
	rates: Record<string, number>;
}

export interface CartCalculationContext<TItem extends CartItem = CartItem> {
	state: CartState<TItem>;
	totals: CartTotals;
	currency: {
		base: CurrencyCode;
		selected: CurrencyCode;
		rate: number;
		rates: Record<string, number>;
	};
}

export type CartStrategy<TItem extends CartItem = CartItem> = (
	ctx: CartCalculationContext<TItem>,
) => Partial<CartTotals> | void | Promise<Partial<CartTotals> | void>;

export type CartHook<TItem extends CartItem = CartItem> = (
	ctx: CartCalculationContext<TItem>,
) => void | Promise<void>;

export interface CartConfig {
	baseCurrency?: CurrencyCode;
	rates?: Record<string, number>;
	autoFetchRates?: boolean;
	rateEndpoint?: string;
	taxPercentMetaKey?: string | null;
	shippingAmountMetaKey?: string | null;
	shippingCurrencyMetaKey?: string | null;
}

export const cartBroadcastKeys = [
	'items',
	'coupon',
	'meta',
	'currency',
] as const;

interface PrivacyPreferences {
	functional?: boolean;
	status?: string;
}

interface CartStoreState extends CartState {
	config: Required<CartConfig>;
	exchangeRates: Record<string, number>;
	ratesDate: string | null;
	ratesLoaded: boolean;
	ratesPending: boolean;
	ratesError: string | null;
	totalsValue: CartTotals;
}

interface CartRuntime {
	strategies: Map<string, CartStrategy>;
	beforeHooks: CartHook[];
	afterHooks: CartHook[];
	stopSubscription: (() => void) | null;
	isApplyingState: boolean;
	isCalculating: boolean;
	isCalculationQueued: boolean;
}

const DEFAULT_BASE_CURRENCY: CurrencyCode = 'USD';

const DEFAULT_USD_RATES: Record<CurrencyCode, number> = {
	USD: 1,
	EUR: 0.87621,
	PLN: 3.7645,
	GBP: 0.75527,
	JPY: 162.16,
	CAD: 1.4222,
	AUD: 1.4528,
	CHF: 0.80847,
	CNY: 6.7904,
	SEK: 9.7227,
	NOK: 9.9281,
	DKK: 6.5546,
	CZK: 21.28,
	HUF: 311.5,
	RON: 4.5983,
	BGN: 1.7139,
	TRY: 46.651,
	UAH: 44.835,
	RUB: 77.746,
	BRL: 5.1746,
	MXN: 17.4775,
	INR: 94.57,
	KRW: 1546.49,
	SGD: 1.2943,
	HKD: 7.8508,
	NZD: 1.7691,
	ZAR: 16.4045,
	AED: 3.6725,
	ILS: 2.9832,
	BYN: 2.93,
};

const emptyTotals = (): CartTotals => ({
	subtotal: 0,
	discount: 0,
	tax: 0,
	shipping: 0,
	total: 0,
	taxes: {},
});

const defaultCartState = (currency = DEFAULT_BASE_CURRENCY): CartState => ({
	items: [],
	coupon: null,
	meta: {},
	currency: normalizeCurrency(currency),
});

const normalizeCurrency = (currency: string): CurrencyCode =>
	currency.trim().toUpperCase() as CurrencyCode;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const normalizeRates = (
	rates: Record<string, number>,
	base: CurrencyCode,
): Record<CurrencyCode, number> => ({
	...(Object.fromEntries(
		Object.entries(rates)
			.filter(([, rate]) => Number.isFinite(rate) && rate > 0)
			.map(([currency, rate]) => [normalizeCurrency(currency), rate]),
	) as Record<CurrencyCode, number>),
	[base]: 1,
});

const rebaseRates = (
	rates: Record<CurrencyCode, number>,
	fromBase: CurrencyCode,
	toBase: CurrencyCode,
) => {
	if (fromBase === toBase) return normalizeRates(rates, toBase);

	const baseRate = rates[toBase];
	if (!baseRate) return normalizeRates(rates, fromBase);

	return normalizeRates(
		Object.fromEntries(
			Object.entries(rates).map(([currency, rate]) => [
				currency,
				rate / baseRate,
			]),
		),
		toBase,
	);
};

const convertAmountValue = (
	amount: number,
	from: string | undefined,
	to: string | undefined,
	rates: Record<string, number>,
	fallbackCurrency: CurrencyCode,
) => {
	const source = normalizeCurrency(from || fallbackCurrency);
	const target = normalizeCurrency(to || fallbackCurrency);
	const sourceRate = rates[source];
	const targetRate = rates[target];

	if (!sourceRate || !targetRate) {
		throw new Error(`Cannot convert "${source}" to "${target}".`);
	}

	return roundMoney((amount / sourceRate) * targetRate);
};

const getItemBasePriceValue = (
	item: CartItem,
	rates: Record<string, number>,
	baseCurrency: CurrencyCode,
) =>
	item.currency
		? convertAmountValue(
				item.price,
				item.currency,
				baseCurrency,
				rates,
				baseCurrency,
			)
		: item.price;

const toJsonSafe = <T>(value: T): T => {
	const seen = new WeakSet<object>();

	const normalize = (input: unknown): unknown => {
		const raw = toRaw(input);

		if (raw === null || typeof raw !== 'object') return raw;
		if (raw instanceof Date) return raw.toISOString();
		if (seen.has(raw)) return undefined;

		seen.add(raw);

		if (Array.isArray(raw)) {
			return raw.map(normalize).filter((item) => item !== undefined);
		}

		return Object.fromEntries(
			Object.entries(raw)
				.map(([key, item]) => [key, normalize(item)])
				.filter(([, item]) => item !== undefined),
		);
	};

	return normalize(value) as T;
};

const normalizeCartState = (
	state: Partial<CartState> | null | undefined,
	fallbackCurrency = DEFAULT_BASE_CURRENCY,
): CartState => {
	const source = state || defaultCartState(fallbackCurrency);

	return {
		items: toJsonSafe(source.items || []).map((item) => ({
			...item,
			id: item.id,
			price: Number(item.price),
			quantity: Math.max(1, Math.floor(Number(item.quantity || 1))),
			currency: item.currency
				? normalizeCurrency(String(item.currency))
				: undefined,
		})),
		coupon: source.coupon ? toJsonSafe(source.coupon) : null,
		meta: toJsonSafe(source.meta || {}),
		currency: normalizeCurrency(source.currency || fallbackCurrency),
	};
};

const parseCookieObject = <T>(value: unknown): T | null => {
	if (!value) return null;
	if (typeof value === 'object') return value as T;

	try {
		return JSON.parse(decodeURIComponent(String(value))) as T;
	} catch {
		return null;
	}
};

const hasFunctionalCookieConsent = () => {
	const preferences = useCookie<string | PrivacyPreferences | null>(
		'privacy-preferences',
	);
	const parsed = parseCookieObject<PrivacyPreferences>(preferences.value);

	return parsed?.status === 'accepted' && parsed.functional === true;
};

const shouldPersistCartState = (state: CartState) =>
	Array.isArray(state.items) && state.items.length > 0;

const readCartCookie = () => {
	if (!hasFunctionalCookieConsent()) return null;

	const cookie = useCookie<CartState | string | null>('cart');
	return parseCookieObject<CartState>(cookie.value);
};

const cartRuntime = new WeakMap<object, CartRuntime>();

const getCartRuntime = (store: object): CartRuntime => {
	const existing = cartRuntime.get(store);
	if (existing) return existing;

	const runtime: CartRuntime = {
		strategies: new Map(),
		beforeHooks: [],
		afterHooks: [],
		stopSubscription: null,
		isApplyingState: false,
		isCalculating: false,
		isCalculationQueued: false,
	};
	cartRuntime.set(store, runtime);

	return runtime;
};

const serializeError = (error: unknown) =>
	error instanceof Error ? error.message : String(error || 'Unknown error');

const readNumberMeta = (
	meta: Record<string, unknown>,
	key: string | null | undefined,
) => {
	if (!key) return 0;

	const value = Number(meta[key]);
	return Number.isFinite(value) ? value : 0;
};

const readStringMeta = (
	meta: Record<string, unknown>,
	key: string | null | undefined,
) => {
	if (!key) return '';

	const value = meta[key];
	return typeof value === 'string' ? value : '';
};

export const useCartStore = defineStore('cart', {
	state: (): CartStoreState => {
		const initial = normalizeCartState(readCartCookie());

		return {
			...initial,
			config: {
				baseCurrency: DEFAULT_BASE_CURRENCY,
				rates: DEFAULT_USD_RATES,
				autoFetchRates: true,
				rateEndpoint: '/api/exchange-rates',
				taxPercentMetaKey: null,
				shippingAmountMetaKey: null,
				shippingCurrencyMetaKey: null,
			},
			exchangeRates: { ...DEFAULT_USD_RATES },
			ratesDate: null,
			ratesLoaded: false,
			ratesPending: false,
			ratesError: null,
			totalsValue: emptyTotals(),
		};
	},

	getters: {
		baseCurrency: (state): CurrencyCode => state.config.baseCurrency,

		rate: (state): number => state.exchangeRates[state.currency] ?? 1,

		availableCurrencies: (state): string[] =>
			Object.keys(state.exchangeRates),

		totalItems: (state): number =>
			state.items.reduce((sum, item) => sum + item.quantity, 0),

		subtotal: (state): number => {
			const baseCurrency = state.config.baseCurrency;
			const rates = state.exchangeRates;

			return roundMoney(
				state.items.reduce(
					(sum, item) =>
						sum +
						getItemBasePriceValue(item, rates, baseCurrency) *
							item.quantity,
					0,
				),
			);
		},

		totals: (state): CartTotals => state.totalsValue,

		convertedTotals: (state): CartTotals => {
			const rate = state.exchangeRates[state.currency] ?? 1;

			return {
				subtotal: roundMoney(state.totalsValue.subtotal * rate),
				discount: roundMoney(state.totalsValue.discount * rate),
				tax: roundMoney(state.totalsValue.tax * rate),
				shipping: roundMoney(state.totalsValue.shipping * rate),
				total: roundMoney(state.totalsValue.total * rate),
				taxes: Object.fromEntries(
					Object.entries(state.totalsValue.taxes).map(
						([key, value]) => [key, roundMoney(value * rate)],
					),
				),
			};
		},

		discount: (state): number =>
			roundMoney(
				state.totalsValue.discount *
					(state.exchangeRates[state.currency] ?? 1),
			),

		tax: (state): number =>
			roundMoney(
				state.totalsValue.tax *
					(state.exchangeRates[state.currency] ?? 1),
			),

		shipping: (state): number =>
			roundMoney(
				state.totalsValue.shipping *
					(state.exchangeRates[state.currency] ?? 1),
			),

		grandTotal: (state): number =>
			roundMoney(
				state.totalsValue.total *
					(state.exchangeRates[state.currency] ?? 1),
			),
	},

	actions: {
		stateSnapshot(): CartState {
			return normalizeCartState(
				{
					items: this.items,
					coupon: this.coupon,
					meta: this.meta,
					currency: this.currency,
				},
				this.baseCurrency,
			);
		},

		initCart() {
			const runtime = getCartRuntime(this);
			if (
				this.config.autoFetchRates &&
				!this.ratesLoaded &&
				!this.ratesPending
			) {
				void this.fetchExchangeRates().catch(() => {});
			}
			if (runtime.stopSubscription) return runtime.stopSubscription;

			this.hydrateFromClientStorage();
			void this.calculateTotals();
			this.persist();

			const stopWatch = watch(
				() =>
					[
						this.items,
						this.coupon,
						this.meta,
						this.currency,
					] as const,
				() => {
					if (runtime.isApplyingState) return;
					if (runtime.isCalculating) {
						runtime.isCalculationQueued = true;
						return;
					}
					void this.calculateTotals();
					this.persist();
				},
				{ deep: true, flush: 'post' },
			);

			runtime.stopSubscription = () => {
				stopWatch();
				runtime.stopSubscription = null;
			};

			return runtime.stopSubscription;
		},

		persist() {
			const state = this.stateSnapshot();
			const cartCookie = useCookie<CartState | null>('cart', {
				path: '/',
				maxAge: 30 * 86400,
			});

			if (!shouldPersistCartState(state)) {
				cartCookie.value = null;

				if (import.meta.client) {
					localStorage.removeItem('cart');
				}
				return;
			}

			if (hasFunctionalCookieConsent()) {
				cartCookie.value = state;
				return;
			}

			cartCookie.value = null;

			if (import.meta.client) {
				localStorage.setItem('cart', JSON.stringify(state));
			}
		},

		hydrateFromClientStorage() {
			if (!import.meta.client || hasFunctionalCookieConsent()) return;

			try {
				const raw = localStorage.getItem('cart');
				if (!raw) return;
				this.applyState(JSON.parse(raw) as CartState);
			} catch {
				localStorage.removeItem('cart');
			}
		},

		applyState(state: Partial<CartState> | null | undefined) {
			const runtime = getCartRuntime(this);
			const next = normalizeCartState(state, this.baseCurrency);

			runtime.isApplyingState = true;
			try {
				this.items = next.items;
				this.coupon = next.coupon;
				this.meta = next.meta;
				this.currency = this.exchangeRates[next.currency]
					? next.currency
					: this.baseCurrency;
			} finally {
				runtime.isApplyingState = false;
			}
			void this.calculateTotals();
			this.persist();
		},

		convertAmount(amount: number, from?: string, to?: string) {
			return convertAmountValue(
				amount,
				from,
				to,
				this.exchangeRates,
				this.baseCurrency,
			);
		},

		getItemBasePrice(item: CartItem) {
			return getItemBasePriceValue(
				item,
				this.exchangeRates,
				this.baseCurrency,
			);
		},

		calculationContext(
			state: CartState,
			totals: CartTotals,
		): CartCalculationContext {
			return {
				state,
				totals,
				currency: {
					base: this.baseCurrency,
					selected: this.currency,
					rate: this.rate,
					rates: { ...this.exchangeRates },
				},
			};
		},

		configureCart(options: CartConfig) {
			const nextBase = normalizeCurrency(
				options.baseCurrency || this.config.baseCurrency,
			);
			const shouldRebaseRates =
				nextBase !== this.config.baseCurrency && !options.rates;
			const nextRates = options.rates
				? normalizeRates(options.rates, nextBase)
				: shouldRebaseRates
					? rebaseRates(
							this.exchangeRates,
							this.config.baseCurrency,
							nextBase,
						)
					: this.exchangeRates;

			this.config = {
				...this.config,
				...options,
				baseCurrency: nextBase,
				rates: nextRates,
			};

			this.exchangeRates = nextRates;
			if (options.rates) this.ratesLoaded = true;
			if (!this.exchangeRates[this.currency]) this.currency = nextBase;
			void this.calculateTotals();
		},

		setCurrency(code: string) {
			const next = normalizeCurrency(code);
			if (!this.exchangeRates[next]) {
				throw new Error(
					`Currency "${next}" is not available in cart rates.`,
				);
			}

			this.currency = next;
			void this.calculateTotals();
			this.persist();
		},

		addItem(item: AddCartItem) {
			const quantity = Math.max(1, Number(item.quantity ?? 1));
			const existing = this.items.find(
				(cartItem) => cartItem.id === item.id,
			);
			const itemCurrency = item.currency
				? normalizeCurrency(item.currency)
				: undefined;

			if (itemCurrency && !this.exchangeRates[itemCurrency]) {
				throw new Error(
					`Currency "${itemCurrency}" is not available in cart rates.`,
				);
			}

			if (existing) {
				existing.quantity += quantity;
			} else {
				this.items.push(
					toJsonSafe({
						...item,
						currency: itemCurrency,
						quantity,
						price: Number(item.price),
					}),
				);
			}

			void this.calculateTotals();
			this.persist();
		},

		removeItem(id: CartItemId) {
			this.items = this.items.filter((item) => item.id !== id);
			void this.calculateTotals();
			this.persist();
		},

		updateQuantity(id: CartItemId, quantity: number) {
			const item = this.items.find((cartItem) => cartItem.id === id);
			if (!item) return;

			const nextQuantity = Math.max(0, Math.floor(quantity));
			if (nextQuantity === 0) {
				this.removeItem(id);
				return;
			}

			item.quantity = nextQuantity;
			void this.calculateTotals();
			this.persist();
		},

		incrementItem(id: CartItemId, step = 1) {
			const item = this.items.find((cartItem) => cartItem.id === id);
			if (item) this.updateQuantity(id, item.quantity + step);
		},

		clearCart() {
			this.items = [];
			this.coupon = null;
			this.meta = {};
			this.currency = this.baseCurrency;
			this.totalsValue = emptyTotals();
			this.persist();
		},

		applyCoupon(
			couponOrCode: Coupon | string,
			discountPercent?: number,
			discountAmount?: number,
		) {
			this.coupon =
				typeof couponOrCode === 'string'
					? { code: couponOrCode, discountPercent, discountAmount }
					: toJsonSafe(couponOrCode);

			void this.calculateTotals();
			this.persist();
		},

		removeCoupon() {
			this.coupon = null;
			void this.calculateTotals();
			this.persist();
		},

		async setMeta(key: string, value: unknown) {
			this.meta = { ...this.meta, [key]: toJsonSafe(value) };
			await this.calculateTotals();
			this.persist();
		},

		async patchMeta(value: Record<string, unknown>) {
			this.meta = { ...this.meta, ...toJsonSafe(value) };
			await this.calculateTotals();
			this.persist();
		},

		getMeta<T = unknown>(key: string): T | undefined {
			return this.meta[key] as T | undefined;
		},

		resetStorage() {
			const cartCookie = useCookie<CartState | null>('cart', {
				path: '/',
			});
			cartCookie.value = null;

			if (import.meta.client) {
				localStorage.removeItem('cart');
			}
		},

		addStrategy(name: string, strategy: CartStrategy) {
			getCartRuntime(this).strategies.set(name, strategy);
			void this.calculateTotals();
		},

		removeStrategy(name: string) {
			getCartRuntime(this).strategies.delete(name);
			void this.calculateTotals();
		},

		setExchangeRate(currencyCode: string, nextRate: number) {
			const nextCurrency = normalizeCurrency(currencyCode);
			if (!Number.isFinite(nextRate) || nextRate <= 0) {
				throw new Error(`Invalid exchange rate for "${nextCurrency}".`);
			}

			this.exchangeRates = {
				...this.exchangeRates,
				[nextCurrency]: nextRate,
				[this.baseCurrency]: 1,
			};
			void this.calculateTotals();
		},

		setExchangeRates(rates: Record<string, number>, base?: string) {
			const nextBase = normalizeCurrency(base || this.baseCurrency);
			this.config.baseCurrency = nextBase;
			this.exchangeRates = normalizeRates(rates, nextBase);
			this.ratesLoaded = true;
			if (!this.exchangeRates[this.currency]) this.currency = nextBase;
			void this.calculateTotals();
		},

		async fetchExchangeRates(currencies?: string[]) {
			const requestedCurrencies = currencies || this.availableCurrencies;

			this.ratesPending = true;
			this.ratesError = null;

			try {
				const response = await $fetch<CurrencyRates>(
					this.config.rateEndpoint,
					{
						query: {
							base: this.baseCurrency,
							currencies: requestedCurrencies.join(','),
						},
					},
				);

				this.setExchangeRates(response.rates, response.base);
				this.ratesDate = response.date || null;
				return response;
			} catch (error) {
				this.ratesError = serializeError(error);
				throw error;
			} finally {
				this.ratesPending = false;
			}
		},

		onBeforeCalculate(fn: CartHook) {
			const runtime = getCartRuntime(this);
			runtime.beforeHooks.push(fn);
			return () => {
				const index = runtime.beforeHooks.indexOf(fn);
				if (index >= 0) runtime.beforeHooks.splice(index, 1);
			};
		},

		onAfterCalculate(fn: CartHook) {
			const runtime = getCartRuntime(this);
			runtime.afterHooks.push(fn);
			return () => {
				const index = runtime.afterHooks.indexOf(fn);
				if (index >= 0) runtime.afterHooks.splice(index, 1);
			};
		},

		async calculateTotals() {
			const runtime = getCartRuntime(this);
			if (runtime.isCalculating) {
				runtime.isCalculationQueued = true;
				return;
			}

			runtime.isCalculating = true;
			try {
				do {
					runtime.isCalculationQueued = false;
					const state = this.stateSnapshot();
					const base = emptyTotals();

					base.subtotal = roundMoney(
						state.items.reduce(
							(sum, item) =>
								sum +
								getItemBasePriceValue(
									item,
									this.exchangeRates,
									this.baseCurrency,
								) *
									item.quantity,
							0,
						),
					);

					const beforeContext = this.calculationContext(state, {
						...base,
					});
					for (const hook of runtime.beforeHooks) {
						await hook(beforeContext);
					}

					if (state.coupon?.discountAmount != null) {
						base.discount = Math.min(
							state.coupon.discountAmount,
							base.subtotal,
						);
					} else if (state.coupon?.discountPercent != null) {
						base.discount = Math.min(
							(base.subtotal * state.coupon.discountPercent) /
								100,
							base.subtotal,
						);
					}

					const taxPercent = readNumberMeta(
						state.meta,
						this.config.taxPercentMetaKey,
					);
					const shippingAmount = readNumberMeta(
						state.meta,
						this.config.shippingAmountMetaKey,
					);
					const shippingCurrency =
						readStringMeta(
							state.meta,
							this.config.shippingCurrencyMetaKey,
						) ||
						state.currency ||
						this.baseCurrency;

					if (taxPercent > 0) {
						base.tax +=
							((base.subtotal - base.discount) * taxPercent) /
							100;
					}

					if (shippingAmount > 0) {
						base.shipping += this.convertAmount(
							shippingAmount,
							shippingCurrency,
							this.baseCurrency,
						);
					}

					for (const strategy of runtime.strategies.values()) {
						const result = await strategy(
							this.calculationContext(state, { ...base }),
						);
						if (result) Object.assign(base, result);
					}

					base.discount = roundMoney(Math.max(0, base.discount));
					base.tax = roundMoney(Math.max(0, base.tax));
					base.shipping = roundMoney(Math.max(0, base.shipping));
					base.total = roundMoney(
						Math.max(
							0,
							base.subtotal -
								base.discount +
								base.tax +
								base.shipping,
						),
					);
					this.totalsValue = base;

					const afterContext = this.calculationContext(state, {
						...this.totalsValue,
					});
					for (const hook of runtime.afterHooks) {
						await hook(afterContext);
					}
				} while (runtime.isCalculationQueued);
			} finally {
				runtime.isCalculating = false;
			}
		},
	},
});
