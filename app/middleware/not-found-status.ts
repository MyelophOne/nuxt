export default defineNuxtRouteMiddleware(() => {
	if (!import.meta.server) {
		return;
	}

	const event = useRequestEvent();

	if (event) {
		setResponseStatus(event, 404, 'Not Found');
	}
});
