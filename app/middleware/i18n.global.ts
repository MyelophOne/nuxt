import { useMyelophoneConfig } from '~/utils/myelophoneConfig';

export default defineNuxtRouteMiddleware((to) => {
	const config = useMyelophoneConfig().multi18n;

	const { defaultLocale, locales } = config;
	const segments = to.path.split('/').filter(Boolean);

	const firstSegment = segments[0] ?? '';

	if (locales.includes(firstSegment)) {
		if (firstSegment === defaultLocale) {
			const cleanPath = `/${segments.slice(1).join('/')}`;
			return navigateTo(cleanPath || '/', { redirectCode: 301 });
		}
	}
});
