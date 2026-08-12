export default defineNuxtPlugin((nuxtApp) => {
	if (!import.meta.client) return;

	const initialY = window.scrollY;

	if (initialY > 0) {
		const originalScrollTo = window.scrollTo;

		window.scrollTo = function (x?: any, y?: any) {
			const targetY = typeof x === 'object' ? x.top : y;

			if (targetY === 0) return;

			return originalScrollTo.apply(this, arguments as any);
		};

		nuxtApp.hook('app:suspense:resolve', () => {
			window.scrollTo = originalScrollTo;
		});
	}
});
