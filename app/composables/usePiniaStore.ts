// biome-ignore lint/suspicious/noExplicitAny: generic type
export function usePiniaStore<S extends (...args: any) => any>(storeFn: S) {
	const pinia = useNuxtApp().$pinia;
	return storeFn(pinia);
}
