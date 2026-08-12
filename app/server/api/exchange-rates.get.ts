interface FrankfurterRate {
	date: string;
	base: string;
	quote: string;
	rate: number;
	providers?: string[];
}

interface FrankfurterErrorResponse {
	message?: string;
}

interface FetchErrorLike {
	status?: number;
	statusCode?: number;
	statusText?: string;
	statusMessage?: string;
	message?: string;
	data?: FrankfurterErrorResponse;
}

type CurrencyConfigValue =
	string | string[] | readonly string[] | null | undefined;

const FRANKFURTER_RATES_URL = 'https://api.frankfurter.dev/v2/rates';

const normalizeCurrency = (value: unknown, fallback = ''): string => {
	const normalized = String(value ?? fallback)
		.trim()
		.toUpperCase()
		.replace(/[^A-Z]/g, '');

	return normalized || fallback;
};

const isValidCurrencyCode = (currency: string): boolean => {
	return /^[A-Z]{3}$/.test(currency);
};

const parseCurrencyList = (
	value: CurrencyConfigValue,
	base: string,
): string[] => {
	const rawValues = Array.isArray(value)
		? value
		: String(value ?? '').split(',');

	return [
		...new Set(
			rawValues
				.flatMap((item) => String(item).split(','))
				.map((item) => normalizeCurrency(item))
				.filter(
					(currency) =>
						currency !== base && isValidCurrencyCode(currency),
				),
		),
	];
};

const parseQueryCurrencies = (
	searchParams: URLSearchParams,
	base: string,
): string[] => {
	const values = searchParams.getAll('currencies');

	return parseCurrencyList(values, base);
};

const getProviderStatus = (error: unknown): number | undefined => {
	if (!error || typeof error !== 'object') {
		return undefined;
	}

	const fetchError = error as FetchErrorLike;

	return fetchError.statusCode ?? fetchError.status;
};

const getProviderErrorMessage = (error: unknown): string => {
	if (!error || typeof error !== 'object') {
		return 'Unknown currency provider error.';
	}

	const fetchError = error as FetchErrorLike;

	return (
		fetchError.data?.message ??
		fetchError.statusMessage ??
		fetchError.statusText ??
		fetchError.message ??
		'Unknown currency provider error.'
	);
};

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();

	const requestUrl = getRequestURL(event);

	const configuredBase = normalizeCurrency(
		config.public.frankfurterBaseCurrency,
		'USD',
	);

	const base = normalizeCurrency(
		requestUrl.searchParams.get('base'),
		configuredBase,
	);

	if (!isValidCurrencyCode(base)) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid Currency',
			message:
				'The "base" parameter must be a valid three-letter currency code, for example USD, EUR, RUB or BYN.',
		});
	}

	const queryCurrencies = parseQueryCurrencies(requestUrl.searchParams, base);

	const configuredCurrencies = parseCurrencyList(
		config.public.frankfurterCurrencies as CurrencyConfigValue,
		base,
	);

	const currencies =
		queryCurrencies.length > 0 ? queryCurrencies : configuredCurrencies;

	const providerUrl = new URL(FRANKFURTER_RATES_URL);

	providerUrl.searchParams.set('base', base);

	if (currencies.length > 0) {
		providerUrl.searchParams.set('quotes', currencies.join(','));
	}

	let response: FrankfurterRate[];

	try {
		response = await $fetch<FrankfurterRate[]>(providerUrl.toString(), {
			method: 'GET',
			headers: {
				accept: 'application/json',
			},
			retry: 1,
			timeout: 10_000,
		});
	} catch (error: unknown) {
		const providerStatus = getProviderStatus(error);

		const providerMessage = getProviderErrorMessage(error);

		if (
			providerStatus === 400 ||
			providerStatus === 404 ||
			providerStatus === 422
		) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Invalid Currency Request',
				message: providerMessage,
				cause: error,
			});
		}

		throw createError({
			statusCode: 502,
			statusMessage: 'Currency Provider Error',
			message: 'Failed to retrieve exchange rates from Frankfurter.',
			cause: error,
		});
	}

	if (!Array.isArray(response)) {
		throw createError({
			statusCode: 502,
			statusMessage: 'Invalid Provider Response',
			message: 'Frankfurter returned an unexpected response format.',
		});
	}

	const rates: Record<string, number> = {
		[base]: 1,
	};

	const responseDates: string[] = [];

	for (const item of response) {
		const quote = normalizeCurrency(item?.quote);

		if (
			!isValidCurrencyCode(quote) ||
			typeof item.rate !== 'number' ||
			!Number.isFinite(item.rate) ||
			item.rate <= 0
		) {
			continue;
		}

		rates[quote] = item.rate;

		if (item.date) {
			responseDates.push(item.date);
		}
	}

	const date = responseDates.sort().at(-1) ?? null;

	return {
		base,
		date,
		rates,
		source: FRANKFURTER_RATES_URL,
	};
});
