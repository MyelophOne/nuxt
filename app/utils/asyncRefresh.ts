// biome-ignore lint/suspicious/noExplicitAny: generic type
export const useAsyncRefresh = (refresh: (opts?: any) => Promise<void>) => {
	return () => refresh();
};
