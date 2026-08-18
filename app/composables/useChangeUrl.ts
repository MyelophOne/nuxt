import type { LocationQuery, RouteLocationAsPathGeneric } from 'vue-router';

export interface ChangeUrlOptions {
	replace?: boolean;
	mergeQuery?: boolean;
}

export const useChangeUrl = () => {
	const router = useRouter();
	const route = useRoute();
	const requestUrl = useRequestURL();

	const changeUrl = async (
		target:
			string | { path?: string; query?: LocationQuery; hash?: string },
		options: ChangeUrlOptions = {},
	) => {
		const { replace = true, mergeQuery = true } = options;

		let nextPath = route.path;
		let nextQuery: LocationQuery = mergeQuery ? { ...route.query } : {};
		let nextHash = route.hash;

		if (typeof target === 'string') {
			const url = new URL(target, requestUrl.origin);
			nextPath = url.pathname;
			nextHash = url.hash;

			const searchParams = Object.fromEntries(url.searchParams.entries());
			nextQuery = mergeQuery
				? { ...route.query, ...searchParams }
				: searchParams;
		} else {
			if (target.path !== undefined) nextPath = target.path;
			if (target.hash !== undefined) nextHash = target.hash;
			if (target.query !== undefined) {
				nextQuery = mergeQuery
					? { ...route.query, ...target.query }
					: target.query;
			}
		}

		const to: RouteLocationAsPathGeneric = {
			path: nextPath,
			query: nextQuery,
			hash: nextHash,
		};

		if (import.meta.client) {
			return replace ? await router.replace(to) : await router.push(to);
		}
	};

	const updateQuery = async (
		newQuery: Record<string, string | number | boolean | null | undefined>,
		options: ChangeUrlOptions = {},
	) => {
		const cleanedQuery: LocationQuery = {};

		Object.entries(newQuery).forEach(([key, val]) => {
			if (val !== null && val !== undefined) {
				cleanedQuery[key] = String(val);
			}
		});

		return await changeUrl({ query: cleanedQuery }, options);
	};

	return {
		changeUrl,
		updateQuery,
	};
};
