export default defineNuxtPlugin(() => {
	const version = useNuxtVersion();
	return { provide: { nuxtVersion: version } };
});
