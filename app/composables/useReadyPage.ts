import type { CSSProperties } from 'vue';

export type DeepPartial<T> =
	T extends Array<infer U>
		? U[]
		: T extends object
			? { [K in keyof T]?: DeepPartial<T[K]> }
			: T;

export type ReadyContentByLocale<T> = Record<string, DeepPartial<T>>;

export interface ReadySeoContent {
	seo: {
		title: string;
		description: string;
		ogTitle?: string;
		ogDescription?: string;
	};
}

interface UseReadyPageOptions<T extends ReadySeoContent> {
	contentByLocale: Record<string, T>;
	content?: MaybeRefOrGetter<DeepPartial<T> | undefined>;
	overridesByLocale?: MaybeRefOrGetter<ReadyContentByLocale<T> | undefined>;
	fallbackLocale?: string;
}

interface UseReadyPageResult<T> {
	activeLocale: ComputedRef<string>;
	availableLocales: ComputedRef<string[]>;
	currentContent: ComputedRef<T>;
	resolvedContentByLocale: ComputedRef<Record<string, T>>;
}

export function mergeReadyContent<T>(base: T, override?: DeepPartial<T>): T {
	if (override === undefined) return base;

	if (Array.isArray(base)) {
		return (Array.isArray(override) ? override : base) as T;
	}

	if (base && typeof base === 'object') {
		const result = { ...base } as Record<string, unknown>;
		const source = (override || {}) as Record<string, unknown>;

		for (const key of Object.keys(source)) {
			const value = source[key];
			if (value === undefined) continue;

			const initial = (base as Record<string, unknown>)[key];
			result[key] =
				initial &&
				typeof initial === 'object' &&
				!Array.isArray(initial) &&
				value &&
				typeof value === 'object' &&
				!Array.isArray(value)
					? mergeReadyContent(initial, value)
					: value;
		}

		return result as T;
	}

	return (override ?? base) as T;
}

export function readyCssVariables<T extends object>(
	values: T,
	prefix = 'ready',
): CSSProperties {
	return Object.fromEntries(
		Object.entries(values as Record<string, string | number | undefined>)
			.filter(
				(entry): entry is [string, string | number] =>
					entry[1] !== undefined,
			)
			.map(([key, value]) => [
				`--${prefix}-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
				String(value),
			]),
	) as CSSProperties;
}

export function useReadyPage<T extends ReadySeoContent>(
	options: UseReadyPageOptions<T>,
): UseReadyPageResult<T> {
	const fallbackLocale = (options.fallbackLocale || 'en').toLowerCase();
	const settingsStore = useSettingsStore(useNuxtApp().$pinia);
	const myelophoneConfig = useMyelophoneConfig();

	const activeLocale = computed(() =>
		(
			settingsStore.currentLocale ||
			settingsStore.defaultLocale ||
			fallbackLocale
		).toLowerCase(),
	);

	const configuredLocales = computed(() => {
		const multi18n = myelophoneConfig.multi18n as
			{ locales?: string[] } | undefined;
		return multi18n?.locales || [];
	});
	const content = computed(() => toValue(options.content));
	const overridesByLocale = computed(
		() => toValue(options.overridesByLocale) || {},
	);

	const availableLocales = computed(() => [
		...new Set(
			[
				...configuredLocales.value,
				...Object.keys(options.contentByLocale),
				...Object.keys(overridesByLocale.value),
			].map((locale) => locale.toLowerCase()),
		),
	]);

	const resolvedContentByLocale = computed<Record<string, T>>(() =>
		Object.fromEntries(
			availableLocales.value.map((locale) => {
				const baseLocale = locale.split('-')[0] || fallbackLocale;
				const defaults =
					options.contentByLocale[locale] ||
					options.contentByLocale[baseLocale] ||
					options.contentByLocale[fallbackLocale];

				if (!defaults) {
					throw new Error(
						`[ready] Missing fallback content for locale "${fallbackLocale}"`,
					);
				}

				const localeOverride =
					overridesByLocale.value[locale] ||
					overridesByLocale.value[baseLocale];

				return [
					locale,
					mergeReadyContent(
						mergeReadyContent(defaults, content.value),
						localeOverride,
					),
				];
			}),
		),
	);

	const currentContent = computed(() => {
		const baseLocale = activeLocale.value.split('-')[0] || fallbackLocale;
		const content =
			resolvedContentByLocale.value[activeLocale.value] ||
			resolvedContentByLocale.value[baseLocale] ||
			resolvedContentByLocale.value[fallbackLocale];

		if (!content) {
			throw new Error(
				`[ready] Unable to resolve content for locale "${activeLocale.value}"`,
			);
		}

		return content;
	});

	useSeoMeta({
		title: () => currentContent.value.seo.title,
		description: () => currentContent.value.seo.description,
		ogTitle: () =>
			currentContent.value.seo.ogTitle || currentContent.value.seo.title,
		ogDescription: () =>
			currentContent.value.seo.ogDescription ||
			currentContent.value.seo.description,
	});

	return {
		activeLocale,
		availableLocales,
		currentContent,
		resolvedContentByLocale,
	};
}
