interface BreadcrumbItem {
	title: string;
	path: string;
}

export const useBreadcrumbs = () => {
	const route = useRoute();
	const config = useRuntimeConfig();
	const { t } = useMultiLang(['common', 'menu']);

	const breadcrumbs = useState<BreadcrumbItem[]>(
		'shared-breadcrumbs',
		() => [],
	);

	const supportedLocales = (config.public.multi18n?.locales ?? []).map(
		(l: string) => l.toLowerCase(),
	);

	const detectedLocale = computed(() => {
		const firstSegment = route.path.split('/').filter(Boolean)[0];
		return firstSegment &&
			supportedLocales.includes(firstSegment.toLowerCase())
			? firstSegment
			: null;
	});

	const homePath = computed(() =>
		detectedLocale.value ? `/${detectedLocale.value}` : '/',
	);

	const homeLabel = computed(() => {
		const key = 'common.homepage';
		const res = t(key);
		return res === key ? 'Home' : res;
	});

	const truncate = (text: string, max: number) => {
		if (!text || text.length <= max) return text;
		const subString = text.substring(0, max);
		const lastSpace = subString.lastIndexOf(' ');
		return (
			(lastSpace > 0 ? subString.substring(0, lastSpace) : subString) +
			'...'
		);
	};

	const updateBreadcrumbs = () => {
		const pathSegments = route.path.split('/').filter((p) => p !== '');
		const segments = detectedLocale.value
			? pathSegments.slice(1)
			: pathSegments;

		const list = segments.map((path, index) => {
			const basePath = detectedLocale.value
				? `/${detectedLocale.value}`
				: '';
			const fullPath =
				basePath + '/' + segments.slice(0, index + 1).join('/');

			const routeMatch = route.matched.find(
				(m) =>
					m.path.replace(/\/$/, '') === fullPath.replace(/\/$/, ''),
			);

			const isLast = index === segments.length - 1;
			let title = '';

			if (isLast && route.meta.breadcrumbTitle) {
				title = route.meta.breadcrumbTitle as string;
			} else {
				title = (routeMatch?.meta?.breadcrumbTitle ||
					routeMatch?.meta?.title ||
					'') as string;
			}

			if (!title) {
				const translationKey = `menu.${path.replace(/-/g, '_')}`;
				const translated = t(translationKey);
				title = translated === translationKey ? path : translated;
			}

			return {
				title: String(title),
				path: fullPath,
			};
		});

		breadcrumbs.value = list;
	};

	watch(
		[() => route.path, () => route.meta.breadcrumbTitle],
		() => {
			updateBreadcrumbs();
		},
		{ immediate: true, deep: true },
	);

	return {
		breadcrumbs,
		homePath,
		homeLabel,
		truncate,
	};
};
