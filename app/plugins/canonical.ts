export default defineNuxtPlugin(() => {
	const route = useRoute();
	const url = useRequestURL();

	const canonicalUrl = computed(() => {
		const origin = url.origin;
		const path = route.path;

		const normalizedPath =
			path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

		const queryParts = [];
		if (route.query.page) {
			queryParts.push(`page=${route.query.page}`);
		}
		const queryString =
			queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

		return `${origin}${normalizedPath}${queryString}`;
	});

	useHead({
		link: [
			{
				rel: 'canonical',
				href: canonicalUrl,
			},
		],
	});
});
