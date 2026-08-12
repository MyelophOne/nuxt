type StorageKind = 'local' | 'session' | 'cookie';

interface Serializer<T> {
	read: (value: string) => T;
	write: (value: T) => string;
}

interface StorageOptions<T> {
	storage?: StorageKind;
	fallbackStorage?: Exclude<StorageKind, 'cookie'>;
	expires?: number;
	path?: string;
	deep?: boolean;
	syncTabs?: boolean;
	writeDefault?: boolean;
	serializer?: Serializer<T>;
	canUseCookie?: () => boolean;
	shouldPersist?: (value: T) => boolean;
}

const jsonSerializer = <T>(): Serializer<T> => ({
	read: (value) => JSON.parse(value) as T,
	write: (value) => JSON.stringify(toRaw(value)),
});

const cloneValue = <T>(value: T): T => {
	if (typeof structuredClone === 'function') return structuredClone(value);
	return JSON.parse(JSON.stringify(value)) as T;
};

const isStorageAvailable = (kind: Exclude<StorageKind, 'cookie'>) => {
	if (!import.meta.client) return false;

	try {
		const storage = kind === 'session' ? sessionStorage : localStorage;
		const key = '__storage_test__';
		storage.setItem(key, key);
		storage.removeItem(key);
		return true;
	} catch {
		return false;
	}
};

export function useStorage<T>(
	key: string,
	defaultValue: T,
	options: StorageOptions<T> = {},
): { value: Ref<T>; remove: () => void; refresh: () => void } {
	const {
		storage: preferred = 'local',
		fallbackStorage = 'local',
		expires = 365,
		path = '/',
		deep = true,
		syncTabs = true,
		writeDefault = true,
		serializer = jsonSerializer<T>(),
		canUseCookie = () => true,
		shouldPersist = () => true,
	} = options;

	const getDefaultValue = () => cloneValue(defaultValue);
	const state = ref<T>(getDefaultValue()) as Ref<T>;
	let broadcast: BroadcastChannel | null = null;
	let isApplyingExternalUpdate = false;
	let isRemoving = false;

	const canUsePreferredCookie = () =>
		preferred === 'cookie' && canUseCookie();

	const getEffectiveStorage = (): StorageKind => {
		if (preferred !== 'cookie') return preferred;
		return canUsePreferredCookie() ? 'cookie' : fallbackStorage;
	};

	const getWebStorage = (kind = getEffectiveStorage()) => {
		if (kind === 'cookie' || !isStorageAvailable(kind)) return null;
		return kind === 'session' ? sessionStorage : localStorage;
	};

	const read = (): T => {
		const storageKind = getEffectiveStorage();

		if (storageKind === 'cookie') {
			const cookie = useCookie<T | null>(key, {
				path,
				maxAge: expires * 86400,
			});
			return cookie.value ?? getDefaultValue();
		}

		const storage = getWebStorage();
		if (!storage) return getDefaultValue();

		try {
			const raw = storage.getItem(key);
			return raw === null ? getDefaultValue() : serializer.read(raw);
		} catch (error) {
			console.warn(`[useStorage:${key}] failed to read`, error);
			return getDefaultValue();
		}
	};

	const write = (value: T) => {
		if (!shouldPersist(value)) {
			clearStoredValue();
			return;
		}

		const storageKind = getEffectiveStorage();

		if (storageKind === 'cookie') {
			const cookie = useCookie<T>(key, {
				path,
				maxAge: expires * 86400,
			});
			cookie.value = value;
			return;
		}

		if (preferred === 'cookie') {
			const cookie = useCookie<T | null>(key, { path });
			cookie.value = null;
		}

		const storage = getWebStorage();
		if (!storage) return;

		try {
			storage.setItem(key, serializer.write(value));
		} catch (error) {
			console.warn(`[useStorage:${key}] failed to write`, error);
		}
	};

	const clearStoredValue = () => {
		if (preferred === 'cookie') {
			const cookie = useCookie<T | null>(key, { path });
			cookie.value = null;
		}

		const storage = getWebStorage(
			preferred === 'cookie' ? fallbackStorage : preferred,
		);
		storage?.removeItem(key);
	};

	const remove = () => {
		try {
			isRemoving = true;
			state.value = getDefaultValue();
		} finally {
			isRemoving = false;
		}

		clearStoredValue();
		broadcast?.postMessage({ type: 'remove' });
	};

	const refresh = () => {
		state.value = read();
	};

	const shouldDeferClientRead =
		import.meta.client && getEffectiveStorage() !== 'cookie';

	if (!shouldDeferClientRead) {
		state.value = read();
		if (writeDefault) write(state.value);
	}

	if (import.meta.client && syncTabs && 'BroadcastChannel' in window) {
		broadcast = new BroadcastChannel(`useStorage:${key}`);
		broadcast.onmessage = (event) => {
			if (!['update', 'remove'].includes(event.data?.type)) return;

			try {
				isApplyingExternalUpdate = true;
				state.value =
					event.data.type === 'remove'
						? getDefaultValue()
						: (event.data.value as T);
				if (event.data.type === 'remove') clearStoredValue();
			} finally {
				isApplyingExternalUpdate = false;
			}
		};
	}

	const stop = watch(
		state,
		(value) => {
			write(value);

			if (!isApplyingExternalUpdate && !isRemoving) {
				broadcast?.postMessage({
					type: 'update',
					value: cloneValue(toRaw(value) as T),
				});
			}
		},
		{ deep, flush: 'sync' },
	);

	const handleStorage = (event: StorageEvent) => {
		if (event.key !== key) return;

		try {
			isApplyingExternalUpdate = true;
			state.value =
				event.newValue === null
					? getDefaultValue()
					: serializer.read(event.newValue);
		} catch (error) {
			console.warn(
				`[useStorage:${key}] failed to sync storage event`,
				error,
			);
		} finally {
			isApplyingExternalUpdate = false;
		}
	};

	if (import.meta.client && syncTabs && getEffectiveStorage() === 'local') {
		window.addEventListener('storage', handleStorage);
	}

	if (shouldDeferClientRead) {
		window.setTimeout(() => {
			state.value = read();
			if (writeDefault) write(state.value);
		}, 0);
	}

	const cleanup = () => {
		stop();
		broadcast?.close();

		if (
			import.meta.client &&
			syncTabs &&
			getEffectiveStorage() === 'local'
		) {
			window.removeEventListener('storage', handleStorage);
		}
	};

	if (getCurrentScope()) onScopeDispose(cleanup);

	return { value: state, remove, refresh };
}
