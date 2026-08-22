import {
	type EntryKey,
	type RefetchOnControl,
	useQuery as useColadaQuery,
	useQueryCache,
} from '@pinia/colada';
import { useQuerySyncStore } from '~/stores/querySync';

export type QueryKey = EntryKey;
export type QueryContext = { signal: AbortSignal; queryKey: QueryKey };

export interface UseQueryOptions {
	server?: boolean;
	immediate?: boolean;
	share?: boolean;
	staleTime?: number;
	gcTime?: number | false;
	retry?: number | ((attempt: number, error: unknown) => boolean);
	retryDelay?: number | ((attempt: number) => number);
	refetchOnMount?: RefetchOnControl;
	refetchOnWindowFocus?: RefetchOnControl;
	refetchOnReconnect?: RefetchOnControl;
	broadcast?: boolean | string;
	debug?: boolean;
	onError?: (error: unknown) => void;
	onStale?: () => void;
}

const wait = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

type FlightMessage =
	| { type: 'claim'; id: string }
	| { type: 'success'; id: string; data: unknown }
	| { type: 'error'; id: string; message: string };

async function crossTabSingleflight<T>(
	key: QueryKey,
	signal: AbortSignal,
	request: () => Promise<T>,
): Promise<T> {
	if (!('BroadcastChannel' in window)) return request();
	const channel = new BroadcastChannel(`query-flight:${JSON.stringify(key)}`);
	const id: string =
		crypto.randomUUID?.() ?? `${Date.now()}:${Math.random()}`;
	const claims = new Set([id]);
	let settle: ((value: T) => void) | undefined;
	let fail: ((reason: unknown) => void) | undefined;
	const remote = new Promise<T>((resolve, reject) => {
		settle = resolve;
		fail = reject;
	});
	channel.addEventListener(
		'message',
		(event: MessageEvent<FlightMessage>) => {
			const message = event.data;
			if (message.type === 'claim') claims.add(message.id);
			if (message.type === 'success') settle?.(message.data as T);
			if (message.type === 'error') fail?.(new Error(message.message));
		},
	);
	channel.postMessage({ type: 'claim', id } satisfies FlightMessage);
	await wait(25);
	if (signal.aborted) {
		channel.close();
		throw new DOMException('Query cancelled', 'AbortError');
	}
	if ([...claims].sort()[0] !== id) {
		try {
			return await Promise.race([
				remote,
				wait(30_000).then(() => request()),
			]);
		} finally {
			channel.close();
		}
	}
	try {
		const data = await request();
		try {
			channel.postMessage({
				type: 'success',
				id,
				data,
			} satisfies FlightMessage);
		} catch {
			// Non-cloneable data cannot be synchronized but the leader still succeeds.
		}
		return data;
	} catch (error) {
		channel.postMessage({
			type: 'error',
			id,
			message: error instanceof Error ? error.message : String(error),
		} satisfies FlightMessage);
		throw error;
	} finally {
		channel.close();
	}
}

export function useQuery<TData>(
	options: {
		key: MaybeRefOrGetter<QueryKey>;
		query: (context: QueryContext) => Promise<TData>;
	} & UseQueryOptions,
) {
	const {
		server = true,
		immediate = true,
		staleTime = 30_000,
		gcTime = 5 * 60_000,
		retry = 2,
		retryDelay = 500,
		debug = false,
		onError,
		onStale,
		broadcast = false,
		query,
		share: _share,
		...coladaOptions
	} = options;

	const result = useColadaQuery<TData>({
		...coladaOptions,
		key: options.key,
		enabled: () => immediate && (server || import.meta.client),
		staleTime,
		gcTime,
		query: async (context) => {
			let attempt = 0;
			while (true) {
				try {
					if (debug && import.meta.dev)
						console.info('[useQuery:request]', context.entry.key);
					const request = () => {
						if (debug && import.meta.dev)
							console.info(
								'[useQuery:network]',
								context.entry.key,
							);
						return query({
							signal: context.signal,
							queryKey: context.entry.key,
						});
					};
					const data =
						broadcast && import.meta.client
							? await crossTabSingleflight(
									context.entry.key,
									context.signal,
									request,
								)
							: await request();
					if (debug && import.meta.dev)
						console.info(
							'[useQuery:success]',
							context.entry.key,
							data,
						);
					return data;
				} catch (error) {
					if (context.signal.aborted) throw error;
					const shouldRetry =
						typeof retry === 'function'
							? retry(attempt + 1, error)
							: attempt < retry;
					if (!shouldRetry) {
						if (debug && import.meta.dev)
							console.error(
								'[useQuery:error]',
								context.entry.key,
								error,
							);
						onError?.(error);
						throw error;
					}
					attempt++;
					const delay =
						typeof retryDelay === 'function'
							? retryDelay(attempt)
							: retryDelay * 2 ** (attempt - 1);
					await wait(delay);
				}
			}
		},
	});
	const cache = useQueryCache();
	const isStale = computed(
		() => cache.get(toValue(options.key))?.stale ?? true,
	);
	const isOutdated = computed(
		() => isStale.value && result.data.value !== undefined,
	);
	if (onStale)
		watch(isOutdated, (outdated, wasOutdated) => {
			if (outdated && !wasOutdated) onStale();
		});
	if (broadcast && import.meta.client)
		useQueryBroadcast(
			[toValue(options.key)],
			typeof broadcast === 'string' ? broadcast : 'queries',
		);
	return { ...result, isStale, isOutdated };
}

export function invalidateQuery(key: QueryKey, exact = false) {
	return useQueryCache().invalidateQueries({ key, exact });
}

export function cancelQuery(key: QueryKey, exact = true) {
	useQueryCache().cancelQueries({ key, exact });
}

export function optimisticWrite<TData>(
	key: QueryKey,
	updater: (current: TData | undefined) => TData,
) {
	const cache = useQueryCache();
	const previous = cache.getQueryData<TData>(key);
	cache.setQueryData<TData>(key, updater(previous));
	return () => cache.setQueryData<TData>(key, previous as TData);
}

export function useQueryBroadcast(
	keys: readonly QueryKey[],
	channel = 'queries',
) {
	if (!import.meta.client) return () => {};
	const cache = useQueryCache();
	const sync = useQuerySyncStore(useNuxtApp().$pinia);
	const ids = keys.map((key) => JSON.stringify(key));
	let applyingRemote = false;
	let lastLocalSnapshot = '';

	const stopLocal = watchEffect(() => {
		if (applyingRemote) return;
		const next = Object.fromEntries(
			keys.map((key, index) => [ids[index]!, cache.getQueryData(key)]),
		);
		const serialized = JSON.stringify(next);
		if (serialized !== JSON.stringify(sync.records)) {
			lastLocalSnapshot = serialized;
			sync.records = next;
		}
	});

	const stopRemote = watch(
		() => sync.records,
		(records) => {
			if (JSON.stringify(records) === lastLocalSnapshot) return;
			applyingRemote = true;
			try {
				keys.forEach((key, index) => {
					const value = records[ids[index]!];
					if (value !== undefined) {
						cache.cancelQueries({ key, exact: true });
						cache.setQueryData(key, value);
					}
				});
			} finally {
				applyingRemote = false;
			}
		},
		{ deep: true },
	);

	const stopBroadcast = useStoreBroadcast(
		sync as unknown as Parameters<typeof useStoreBroadcast>[0],
		{
			keys: ['records'],
			channel: `pinia:${channel}`,
		},
	);
	const stop = () => {
		stopLocal();
		stopRemote();
		stopBroadcast();
		ids.forEach((id) => delete sync.records[id]);
	};
	if (getCurrentInstance()) onScopeDispose(stop);
	return stop;
}

export async function* readJsonStream<T>(
	response: Response,
): AsyncGenerator<T> {
	if (!response.body) throw new TypeError('Response has no readable body');
	const reader = response.body
		.pipeThrough(new TextDecoderStream())
		.getReader();
	let buffer = '';
	try {
		while (true) {
			const { done, value } = await reader.read();
			buffer += value ?? '';
			const lines = buffer.split(/\r?\n/);
			buffer = lines.pop() ?? '';
			for (const line of lines)
				if (line.trim()) yield JSON.parse(line) as T;
			if (done) break;
		}
		if (buffer.trim()) yield JSON.parse(buffer) as T;
	} finally {
		reader.releaseLock();
	}
}
