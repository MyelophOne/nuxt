type TranslationMap = Record<string, any>;
interface NamespaceCache {
	[key: string]: TranslationMap;
}
type InterpolationParams = Record<string, string | number>;

export function useMultiLang(namespaces: string | string[]) {
	const nuxtApp = useNuxtApp();
	const pinia = nuxtApp.$pinia;
	const settingsStore = useSettingsStore(pinia);

	const activeLang = computed(() => settingsStore.currentLocale);
	const defaultLang = settingsStore.defaultLocale || 'en';

	const nsArray = (Array.isArray(namespaces) ? namespaces : [namespaces]).map(
		(ns) => ns.replace(/^\/+|\/+$/g, ''),
	);

	const translationsState = useState<Record<string, NamespaceCache>>(
		'i18n_translations',
		() => ({}),
	);

	const formatNumber = (num: number, l: string) =>
		new Intl.NumberFormat(l).format(num);

	const compactNumber = (num: number, l: string) =>
		new Intl.NumberFormat(l, {
			notation: 'compact',
			maximumFractionDigits: 1,
		}).format(num);

	const isProdDist =
		process.env.PROD_DIST === 'true' ||
		import.meta.env.PROD_DIST === 'true';

	const localesAlias = import.meta.glob('#myelophone-nuxt-locales/**/*.json');
	const localesPlayground = import.meta.glob(
		'~/../playground/locales/**/*.json',
	);
	const localesApp = import.meta.glob('~/locales/**/*.json');

	const allLocalesShort = {
		...localesAlias,
		...localesApp,
	};

	const allLocalesFull = {
		...localesAlias,
		...localesApp,
		...localesPlayground,
	};

	const allLocales = isProdDist ? allLocalesShort : allLocalesFull;

	const isPlainObject = (value: unknown): value is Record<string, any> =>
		Object.prototype.toString.call(value) === '[object Object]';

	const deepMerge = (
		target: Record<string, any>,
		source: Record<string, any>,
	) => {
		Object.entries(source).forEach(([key, value]) => {
			if (isPlainObject(value) && isPlainObject(target[key])) {
				deepMerge(target[key], value);
				return;
			}

			target[key] = value;
		});

		return target;
	};

	const expandDottedKeys = (value: any): any => {
		if (Array.isArray(value)) {
			return value.map(expandDottedKeys);
		}

		if (!isPlainObject(value)) {
			return value;
		}

		const result: Record<string, any> = {};

		Object.entries(value).forEach(([key, rawValue]) => {
			const expandedValue = expandDottedKeys(rawValue);
			const keyParts = key.split('.');

			if (keyParts.length === 1) {
				if (
					isPlainObject(result[key]) &&
					isPlainObject(expandedValue)
				) {
					deepMerge(result[key], expandedValue);
				} else {
					result[key] = expandedValue;
				}

				return;
			}

			let current = result;

			keyParts.forEach((part, index) => {
				const isLast = index === keyParts.length - 1;

				if (isLast) {
					if (
						isPlainObject(current[part]) &&
						isPlainObject(expandedValue)
					) {
						deepMerge(current[part], expandedValue);
					} else {
						current[part] = expandedValue;
					}

					return;
				}

				if (!isPlainObject(current[part])) {
					current[part] = {};
				}

				current = current[part];
			});
		});

		return result;
	};

	const loadNamespace = async (lang: string, ns: string) => {
		if (translationsState.value[lang]?.[ns]) return;

		const targetSuffix = `locales/${lang}/${ns}.json`;
		const matchEntry = Object.entries(allLocales).find(([filePath]) =>
			filePath.replace(/\\/g, '/').endsWith(targetSuffix),
		);

		if (!matchEntry) return;

		try {
			const mod: any = await matchEntry[1]();
			const data = expandDottedKeys(mod.default || mod);

			if (!translationsState.value[lang]) {
				translationsState.value[lang] = {};
			}

			translationsState.value[lang][ns] = data;
		} catch (e) {
			console.error(`Failed to load: ${ns}`, e);
		}
	};

	const { pending, refresh } = useAsyncData(
		`i18n-${activeLang.value}-${nsArray.join('_')}`,
		async () => {
			const mainPromises = nsArray.map((ns) =>
				loadNamespace(activeLang.value, ns),
			);
			await Promise.all(mainPromises);

			if (import.meta.server && activeLang.value !== defaultLang) {
				const fallbackPromises = [];

				for (const ns of nsArray) {
					const mainDict =
						translationsState.value[activeLang.value]?.[ns];

					if (!mainDict) {
						fallbackPromises.push(loadNamespace(defaultLang, ns));
					}
				}

				await Promise.all(fallbackPromises);
			}

			return null;
		},
		{ watch: [activeLang] },
	);

	const t = (
		key: string,
		arg1?: InterpolationParams | number,
		arg2?: number,
		forceRule?: string,
	): string => {
		let params: InterpolationParams = {};
		let count: number | undefined;

		if (typeof arg1 === 'number') {
			count = arg1;
		} else if (typeof arg1 === 'object' && arg1 !== null) {
			params = arg1;
			if (typeof arg2 === 'number') count = arg2;
		}

		const lang = activeLang.value;

		const lookup = (l: string) => {
			const nsCache = translationsState.value[l];
			if (!nsCache) return undefined;

			for (const ns of nsArray) {
				if (key === ns || key.startsWith(`${ns}.`)) {
					const dict = nsCache[ns];
					if (!dict) continue;

					const internalKey = key.slice(ns.length + 1);
					if (!internalKey && typeof count !== 'number')
						return undefined;

					if (typeof count === 'number') {
						const pluralRule =
							forceRule || new Intl.PluralRules(l).select(count);

						const searchKeys =
							count === 0
								? [
										`${internalKey}_zero`,
										`${internalKey}_${pluralRule}`,
										`${internalKey}_other`,
									]
								: [
										`${internalKey}_${pluralRule}`,
										`${internalKey}_other`,
									];

						for (const pk of searchKeys) {
							const val = pk
								.split('.')
								.reduce((acc: any, k) => acc?.[k], dict);
							if (typeof val === 'string') return val;
						}
					}

					const value = internalKey
						.split('.')
						.reduce((acc: any, k) => acc?.[k], dict);
					if (typeof value === 'string') return value;
				}
			}
			return undefined;
		};

		let val = lookup(activeLang.value);

		if (!val && activeLang.value !== defaultLang) {
			val = lookup(defaultLang);

			if (!val && import.meta.client) {
				const ns = nsArray.find((n) => key.startsWith(n + '.'));
				if (ns) loadNamespace(defaultLang, ns);
			}
		}

		const finalStr = val || key;

		return finalStr.replace(/\{(\w+)\}/g, (_, k) => {
			if (k === 'count' && typeof count === 'number')
				return formatNumber(count, lang);
			return params[k] !== undefined ? String(params[k]) : `{${k}}`;
		});
	};

	const tn = (
		key: string,
		count: number,
		params: InterpolationParams = {},
	): string => {
		const lang = activeLang.value;

		const rule = count >= 1000 ? 'many' : undefined;

		const translated = t(key, params, count, rule);

		const formattedCount = compactNumber(count, lang);

		return translated.replace(formatNumber(count, lang), formattedCount);
	};

	return { t, tn, loadPromise: pending, refresh };
}
