export default defineNuxtPlugin(() => {
	const version = import.meta.env.PACKAGE_VERSION || '4.x';
	return { provide: { nuxtVersion: version } };
});
