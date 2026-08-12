type Comparable = string | number | bigint;

type ComparableKey<T> = {
	[K in keyof T]-?: T[K] extends Comparable ? K : never;
}[keyof T];

export const sortBy = <T>(
	arr: readonly T[],
	keys: readonly ComparableKey<T>[],
): T[] =>
	[...arr].sort((a, b) =>
		keys.reduce((res, k) => {
			const av = a[k] as Comparable;
			const bv = b[k] as Comparable;

			return res || (av > bv ? 1 : av < bv ? -1 : 0);
		}, 0),
	);
