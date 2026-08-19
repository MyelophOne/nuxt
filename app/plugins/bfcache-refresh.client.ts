export default defineNuxtPlugin(() => {
	if (import.meta.client) {
		window.addEventListener('pageshow', (event) => {
			if (event.persisted) {
				refreshNuxtData();
			}
		});
	}
});
