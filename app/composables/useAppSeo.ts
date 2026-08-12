export const useAppSeo = (config: {
	title?: any;
	titleKey?: string;
	params?: any;
	description?: any;
	descriptionKey?: string;
	image?: string;
	noIndex?: boolean;
}) => {
	const { t } = useMultiLang(['seo', 'common']);
	const route = useRoute();

	const unpack = (data: any) => {
		const raw = unref(data);
		if (!raw) return {};
		const result: Record<string, any> = {};
		for (const key in raw) {
			result[key] = unref(raw[key]);
		}
		return result;
	};

	const resolveValue = (value: any) => {
		const unwrappedValue = unref(value);
		if (typeof unwrappedValue === 'function') {
			return unwrappedValue();
		}
		return unwrappedValue;
	};

	const seoTitle = computed(() => {
		if (config.title) {
			return resolveValue(config.title);
		}
		if (config.titleKey) {
			const p = unpack(config.params);
			const translated = t(config.titleKey, p);
			return translated !== config.titleKey
				? translated
				: config.titleKey;
		}
		return (route.meta.title as string) || '';
	});

	const seoDescription = computed(() => {
		if (config.description) {
			return resolveValue(config.description);
		}
		if (config.descriptionKey) {
			const p = unpack(config.params);
			const translated = t(config.descriptionKey, p);
			return translated !== config.descriptionKey
				? translated
				: config.descriptionKey;
		}
		return '';
	});

	// TODO: add ogImage

	useSeoMeta({
		title: () => seoTitle.value,
		ogTitle: () => seoTitle.value,
		description: () => seoDescription.value,
		ogDescription: () => seoDescription.value,
		robots: config.noIndex ? 'noindex, nofollow' : 'index, follow',
	});

	watch(
		seoTitle,
		(val) => {
			if (val) route.meta.breadcrumbTitle = val;
		},
		{ immediate: true },
	);

	return { title: seoTitle, description: seoDescription };
};
