type StoreBroadcastValue =
	| string
	| number
	| boolean
	| null
	| StoreBroadcastValue[]
	| { [key: string]: StoreBroadcastValue };

type StoreBroadcastPayload = Record<string, StoreBroadcastValue>;

interface BroadcastableStore {
	$id?: string;
	$patch: (value: Record<string, unknown>) => void;
	[key: string]: unknown;
}

interface StoreBroadcastOptions<TStore extends BroadcastableStore> {
	keys: readonly (Extract<keyof TStore, string> | string)[];
	channel?: string;
}

interface StoreBroadcastMessage {
	source: string;
	store: string;
	payload: StoreBroadcastPayload;
	createdAt: number;
}

const sourceId =
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now()}:${Math.random()}`;

const toBroadcastValue = (value: unknown): StoreBroadcastValue => {
	const seen = new WeakSet<object>();

	const normalize = (input: unknown): StoreBroadcastValue => {
		if (
			input === null ||
			typeof input === 'string' ||
			typeof input === 'number' ||
			typeof input === 'boolean'
		) {
			return input;
		}

		if (input instanceof Date) return input.toISOString();
		if (typeof input !== 'object') return null;
		if (seen.has(input)) return null;

		seen.add(input);

		if (Array.isArray(input)) {
			return input.map((item) => normalize(item));
		}

		return Object.fromEntries(
			Object.entries(input).map(([key, item]) => [key, normalize(item)]),
		);
	};

	return normalize(value);
};

export function useStoreBroadcast<TStore extends BroadcastableStore>(
	store: TStore,
	options: StoreBroadcastOptions<TStore>,
) {
	if (!import.meta.client || !options.keys.length) {
		return () => {};
	}

	const storeId = store.$id || 'store';
	const channelName = options.channel || `pinia:${storeId}`;
	const keys = [...options.keys].map(String);
	const channel =
		'BroadcastChannel' in window ? new BroadcastChannel(channelName) : null;

	let isApplyingRemote = false;
	let lastSerialized = '';

	const snapshot = () =>
		Object.fromEntries(
			keys.map((key) => [key, toBroadcastValue(store[key])]),
		) as StoreBroadcastPayload;

	const post = (payload: StoreBroadcastPayload) => {
		const message: StoreBroadcastMessage = {
			source: sourceId,
			store: storeId,
			payload,
			createdAt: Date.now(),
		};

		channel?.postMessage(message);
	};

	const apply = (message: StoreBroadcastMessage) => {
		if (
			message.source === sourceId ||
			message.store !== storeId ||
			!message.payload
		) {
			return;
		}

		isApplyingRemote = true;
		try {
			store.$patch(message.payload);
			lastSerialized = JSON.stringify(snapshot());
		} finally {
			isApplyingRemote = false;
		}
	};

	channel?.addEventListener('message', (event: MessageEvent) => {
		apply(event.data as StoreBroadcastMessage);
	});

	const stopWatch = watch(
		snapshot,
		(payload) => {
			if (isApplyingRemote) return;

			const serialized = JSON.stringify(payload);
			if (serialized === lastSerialized) return;

			lastSerialized = serialized;
			post(payload);
		},
		{ deep: true, flush: 'post' },
	);

	lastSerialized = JSON.stringify(snapshot());

	const stop = () => {
		stopWatch();
		channel?.close();
	};

	if (getCurrentInstance()) {
		onScopeDispose(stop);
	}

	return stop;
}
