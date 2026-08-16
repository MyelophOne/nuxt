export const useApi = () => {
	const config = useRuntimeConfig();
	const baseURL = import.meta.server
		? ((config.apiBaseServer as string | undefined) ??
			(config.public.apiBase as string | undefined))
		: 'http://localhost:3000';

	const token = useCookie('auth_token');

	const fetch = $fetch.create({
		baseURL,
		headers: {
			'Content-Type': 'application/json',
			...(token.value && { Authorization: `Bearer ${token.value}` }),
		},
		retry: 3,
		retryDelay: 1000,
		onRequest({ options }) {
			const headers = new Headers(options.headers);

			if (
				typeof FormData !== 'undefined' &&
				options.body instanceof FormData
			) {
				headers.delete('Content-Type');
			}

			if (token.value) {
				headers.set('Authorization', `Bearer ${token.value}`);
			}

			options.headers = headers;
		},
		onResponseError({ response }) {
			const message = response.statusText || `Error: ${response.status}`;
			throw createError({
				statusCode: response.status,
				message,
				data: response._data,
			});
		},
	});

	return {
		get: <
			TResponse,
			TQuery extends Record<string, unknown> = Record<string, never>,
		>(
			url: string,
			query?: TQuery,
		) =>
			fetch<TResponse>(url, {
				method: 'GET',
				query,
			}),

		post: <
			TResponse,
			TBody extends Record<string, unknown> | FormData | undefined =
				undefined,
		>(
			url: string,
			body?: TBody,
		) =>
			fetch<TResponse>(url, {
				method: 'POST',
				body,
			}),

		put: <
			TResponse,
			TBody extends Record<string, unknown> | FormData | undefined =
				undefined,
		>(
			url: string,
			body?: TBody,
		) =>
			fetch<TResponse>(url, {
				method: 'PUT',
				body,
			}),

		delete: <TResponse>(url: string) =>
			fetch<TResponse>(url, {
				method: 'DELETE',
			}),
	};
};
