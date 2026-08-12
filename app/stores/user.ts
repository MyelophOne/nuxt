export type UserId = string | number;
export type UserAuthStatus =
	'anonymous' | 'authenticating' | 'authenticated' | 'refreshing' | 'error';

export interface UserProfile {
	id: UserId;
	email?: string;
	name?: string;
	avatarUrl?: string;
	roles?: string[];
	permissions?: string[];
	meta?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface UserSession {
	expiresAt?: string | null;
	issuedAt?: string | null;
	provider?: string;
	meta?: Record<string, unknown>;
}

export interface UserState<TProfile extends UserProfile = UserProfile> {
	profile: TProfile | null;
	session: UserSession | null;
	status: UserAuthStatus;
	error: string | null;
	lastAuthenticatedAt: string | null;
}

export interface UserAuthPayload<TProfile extends UserProfile = UserProfile> {
	profile: TProfile;
	session?: UserSession | null;
}

export interface UserSessionExtensionContext<
	TProfile extends UserProfile = UserProfile,
> {
	profile: TProfile;
	session: UserSession | null;
	state: UserState<TProfile>;
}

export type UserSessionExtender<TProfile extends UserProfile = UserProfile> = (
	ctx: UserSessionExtensionContext<TProfile>,
) =>
	| Partial<UserSession>
	| UserSession
	| null
	| void
	| Promise<Partial<UserSession> | UserSession | null | void>;

export interface UserStoreConfig {
	storageKey?: string;
	cookieMaxAge?: number;
	persistSession?: boolean;
	sessionExtensionSeconds?: number;
}

export const userBroadcastKeys = [
	'profile',
	'session',
	'status',
	'error',
	'lastAuthenticatedAt',
] as const;

interface PrivacyPreferences {
	functional?: boolean;
	status?: string;
}

interface UserStoreState extends UserState {
	config: Required<UserStoreConfig>;
}

interface UserRuntime {
	stopSubscription: (() => void) | null;
	stopBroadcast: (() => void) | null;
	extendSessionHandler: UserSessionExtender | null;
	extendSessionPromise: Promise<UserSession | null> | null;
	isApplyingState: boolean;
}

const DEFAULT_STORAGE_KEY = 'user';

const toJsonSafe = <T>(value: T): T => {
	const seen = new WeakSet<object>();

	const normalize = (input: unknown): unknown => {
		const raw = toRaw(input);

		if (raw === null || typeof raw !== 'object') return raw;
		if (raw instanceof Date) return raw.toISOString();
		if (seen.has(raw)) return undefined;

		seen.add(raw);

		if (Array.isArray(raw)) {
			return raw.map(normalize).filter((item) => item !== undefined);
		}

		return Object.fromEntries(
			Object.entries(raw)
				.map(([key, item]) => [key, normalize(item)])
				.filter(([, item]) => item !== undefined),
		);
	};

	return normalize(value) as T;
};

const normalizeStringArray = (value: unknown): string[] =>
	Array.isArray(value)
		? [
				...new Set(
					value
						.map(String)
						.map((item) => item.trim())
						.filter(Boolean),
				),
			]
		: [];

const normalizeProfile = <TProfile extends UserProfile>(
	profile: Partial<TProfile> | null | undefined,
): TProfile | null => {
	if (!profile?.id && profile?.id !== 0) return null;

	const safe = toJsonSafe(profile) as TProfile;

	return {
		...safe,
		id: safe.id,
		email: safe.email ? String(safe.email).trim().toLowerCase() : undefined,
		name: safe.name ? String(safe.name).trim() : undefined,
		avatarUrl: safe.avatarUrl ? String(safe.avatarUrl).trim() : undefined,
		roles: normalizeStringArray(safe.roles),
		permissions: normalizeStringArray(safe.permissions),
		meta: toJsonSafe(safe.meta || {}),
	} as TProfile;
};

const normalizeSession = (
	session: Partial<UserSession> | null | undefined,
): UserSession | null => {
	if (!session) return null;

	const safe = toJsonSafe(session);

	return {
		...safe,
		expiresAt: safe.expiresAt ? String(safe.expiresAt) : null,
		issuedAt: safe.issuedAt ? String(safe.issuedAt) : null,
		provider: safe.provider ? String(safe.provider) : undefined,
		meta: toJsonSafe(safe.meta || {}),
	};
};

const normalizeStatus = (
	status: unknown,
	hasProfile: boolean,
): UserAuthStatus => {
	if (
		status === 'anonymous' ||
		status === 'authenticating' ||
		status === 'authenticated' ||
		status === 'refreshing' ||
		status === 'error'
	) {
		return status;
	}

	return hasProfile ? 'authenticated' : 'anonymous';
};

const normalizeUserState = <TProfile extends UserProfile>(
	state: Partial<UserState<TProfile>> | null | undefined,
): UserState<TProfile> => {
	const profile = normalizeProfile<TProfile>(state?.profile);
	const session = normalizeSession(state?.session);

	return {
		profile,
		session,
		status: normalizeStatus(state?.status, Boolean(profile)),
		error: state?.error ? String(state.error) : null,
		lastAuthenticatedAt: state?.lastAuthenticatedAt
			? String(state.lastAuthenticatedAt)
			: null,
	};
};

const parseCookieObject = <T>(value: unknown): T | null => {
	if (!value) return null;
	if (typeof value === 'object') return value as T;

	try {
		return JSON.parse(decodeURIComponent(String(value))) as T;
	} catch {
		return null;
	}
};

const hasFunctionalCookieConsent = () => {
	const preferences = useCookie<string | PrivacyPreferences | null>(
		'privacy-preferences',
	);
	const parsed = parseCookieObject<PrivacyPreferences>(preferences.value);

	return parsed?.status === 'accepted' && parsed.functional === true;
};

const shouldPersistUserState = (state: UserState) =>
	(state.status === 'authenticated' || state.status === 'refreshing') &&
	Boolean(state.profile);

const isExpiredSession = (session: UserSession | null) => {
	if (!session?.expiresAt) return false;

	const expiresAt = new Date(session.expiresAt).getTime();
	return Number.isFinite(expiresAt) && expiresAt <= Date.now();
};

const readStoredUserState = () => {
	if (!hasFunctionalCookieConsent()) return null;

	const cookie = useCookie<UserState | string | null>(DEFAULT_STORAGE_KEY);
	return parseCookieObject<UserState>(cookie.value);
};

const userRuntime = new WeakMap<object, UserRuntime>();

const getUserRuntime = (store: object): UserRuntime => {
	const existing = userRuntime.get(store);
	if (existing) return existing;

	const runtime: UserRuntime = {
		stopSubscription: null,
		stopBroadcast: null,
		extendSessionHandler: null,
		extendSessionPromise: null,
		isApplyingState: false,
	};
	userRuntime.set(store, runtime);

	return runtime;
};

const serializeError = (error: unknown) =>
	error instanceof Error ? error.message : String(error || 'Unknown error');

export const useUserStore = defineStore('user', {
	state: (): UserStoreState => {
		const initial = normalizeUserState(readStoredUserState());

		return {
			...initial,
			config: {
				storageKey: DEFAULT_STORAGE_KEY,
				cookieMaxAge: 30 * 86400,
				persistSession: true,
				sessionExtensionSeconds: 3600,
			},
		};
	},

	getters: {
		isAuthenticated: (state): boolean =>
			(state.status === 'authenticated' ||
				state.status === 'refreshing') &&
			Boolean(state.profile) &&
			!isExpiredSession(state.session),

		isAnonymous: (state): boolean => state.status === 'anonymous',

		isPending: (state): boolean =>
			state.status === 'authenticating' || state.status === 'refreshing',

		isSessionExpired: (state): boolean => isExpiredSession(state.session),

		userId: (state): UserId | null => state.profile?.id ?? null,

		user: (state): UserProfile | null => state.profile,

		roles: (state): string[] => state.profile?.roles || [],

		permissions: (state): string[] => state.profile?.permissions || [],
	},

	actions: {
		stateSnapshot(): UserState {
			return normalizeUserState({
				profile: this.profile,
				session: this.session,
				status: this.status,
				error: this.error,
				lastAuthenticatedAt: this.lastAuthenticatedAt,
			});
		},

		initUser() {
			const runtime = getUserRuntime(this);
			if (runtime.stopSubscription) return runtime.stopSubscription;

			this.hydrateFromClientStorage();
			this.persist();

			runtime.stopBroadcast = useStoreBroadcast(this as any, {
				keys: userBroadcastKeys,
			});

			const stopWatch = watch(
				() =>
					[
						this.profile,
						this.session,
						this.status,
						this.error,
						this.lastAuthenticatedAt,
					] as const,
				() => {
					if (runtime.isApplyingState) return;
					this.persist();
				},
				{ deep: true, flush: 'post' },
			);

			runtime.stopSubscription = () => {
				stopWatch();
				runtime.stopBroadcast?.();
				runtime.stopBroadcast = null;
				runtime.stopSubscription = null;
			};

			return runtime.stopSubscription;
		},

		configureUser(options: UserStoreConfig) {
			this.config = {
				...this.config,
				...options,
				storageKey: options.storageKey || this.config.storageKey,
				cookieMaxAge: options.cookieMaxAge ?? this.config.cookieMaxAge,
				persistSession:
					options.persistSession ?? this.config.persistSession,
				sessionExtensionSeconds: Math.max(
					1,
					options.sessionExtensionSeconds ??
						this.config.sessionExtensionSeconds,
				),
			};
			this.persist();
		},

		persist() {
			const state = normalizeUserState({
				...this.stateSnapshot(),
				session: this.config.persistSession ? this.session : null,
			});
			const userCookie = useCookie<UserState | null>(
				this.config.storageKey,
				{
					path: '/',
					maxAge: this.config.cookieMaxAge,
					sameSite: 'lax',
				},
			);

			if (!shouldPersistUserState(state)) {
				userCookie.value = null;

				if (import.meta.client) {
					localStorage.removeItem(this.config.storageKey);
				}
				return;
			}

			if (hasFunctionalCookieConsent()) {
				userCookie.value = state;
				return;
			}

			userCookie.value = null;

			if (import.meta.client) {
				localStorage.setItem(
					this.config.storageKey,
					JSON.stringify(state),
				);
			}
		},

		hydrateFromClientStorage() {
			if (!import.meta.client || hasFunctionalCookieConsent()) return;

			try {
				const raw = localStorage.getItem(this.config.storageKey);
				if (!raw) return;
				this.applyState(JSON.parse(raw) as UserState);
			} catch {
				localStorage.removeItem(this.config.storageKey);
			}
		},

		applyState(state: Partial<UserState> | null | undefined) {
			const runtime = getUserRuntime(this);
			const next = normalizeUserState(state);

			runtime.isApplyingState = true;
			try {
				this.profile = next.profile;
				this.session = next.session;
				this.status = next.status;
				this.error = next.error;
				this.lastAuthenticatedAt = next.lastAuthenticatedAt;
			} finally {
				runtime.isApplyingState = false;
			}

			this.persist();
		},

		setAuthenticating() {
			this.status = 'authenticating';
			this.error = null;
		},

		setRefreshing() {
			this.status = 'refreshing';
			this.error = null;
		},

		setAuthenticated<TProfile extends UserProfile>(
			payload: UserAuthPayload<TProfile>,
		) {
			const profile = normalizeProfile(payload.profile);
			if (!profile) {
				throw new Error(
					'Authenticated user profile must include an id.',
				);
			}

			this.profile = profile;
			this.session = normalizeSession(payload.session);
			this.status = 'authenticated';
			this.error = null;
			this.lastAuthenticatedAt = new Date().toISOString();
			this.persist();
		},

		setProfile<TProfile extends UserProfile>(profile: Partial<TProfile>) {
			const nextProfile = normalizeProfile({
				...(this.profile || {}),
				...profile,
			} as TProfile);
			if (!nextProfile) return;

			this.profile = nextProfile;
			if (this.status === 'anonymous') this.status = 'authenticated';
			this.persist();
		},

		patchProfile(value: Record<string, unknown>) {
			if (!this.profile) return;

			this.profile = normalizeProfile({
				...this.profile,
				...toJsonSafe(value),
			}) as UserProfile;
			this.persist();
		},

		setSession(session: Partial<UserSession> | null) {
			this.session = normalizeSession(session);
			this.persist();
		},

		setSessionExtender(fn: UserSessionExtender | null) {
			const runtime = getUserRuntime(this);
			runtime.extendSessionHandler = fn;

			return () => {
				if (runtime.extendSessionHandler === fn) {
					runtime.extendSessionHandler = null;
				}
			};
		},

		async extendSession() {
			const runtime = getUserRuntime(this);
			if (runtime.extendSessionPromise)
				return runtime.extendSessionPromise;
			if (!this.profile) return null;

			if (!runtime.extendSessionHandler) {
				if (this.isSessionExpired) {
					this.logout();
					return null;
				}

				const issuedAt = new Date();
				this.session = normalizeSession({
					...this.session,
					issuedAt: issuedAt.toISOString(),
					expiresAt: new Date(
						issuedAt.getTime() +
							this.config.sessionExtensionSeconds * 1000,
					).toISOString(),
				});
				this.status = 'authenticated';
				this.error = null;
				this.persist();
				return this.session;
			}

			const previousStatus = this.status;
			this.status = 'refreshing';
			this.error = null;

			runtime.extendSessionPromise = Promise.resolve()
				.then(() =>
					runtime.extendSessionHandler?.({
						profile: this.profile as UserProfile,
						session: this.session,
						state: this.stateSnapshot(),
					}),
				)
				.then((session) => {
					if (session !== undefined) {
						this.session = normalizeSession(session);
					}
					this.status = this.profile ? 'authenticated' : 'anonymous';
					this.persist();
					return this.session;
				})
				.catch((error) => {
					this.status = previousStatus;
					this.error = serializeError(error);
					this.persist();
					throw error;
				})
				.finally(() => {
					runtime.extendSessionPromise = null;
				});

			return runtime.extendSessionPromise;
		},

		hasRole(role: string) {
			return this.roles.includes(role);
		},

		hasAnyRole(roles: string[]) {
			return roles.some((role) => this.hasRole(role));
		},

		hasPermission(permission: string) {
			return this.permissions.includes(permission);
		},

		hasAnyPermission(permissions: string[]) {
			return permissions.some((permission) =>
				this.hasPermission(permission),
			);
		},

		setError(error: unknown) {
			this.status = 'error';
			this.error = serializeError(error);
			this.persist();
		},

		clearError() {
			this.error = null;
			if (this.profile) {
				this.status = 'authenticated';
			} else {
				this.status = 'anonymous';
			}
			this.persist();
		},

		logout() {
			this.profile = null;
			this.session = null;
			this.status = 'anonymous';
			this.error = null;
			this.lastAuthenticatedAt = null;
			this.resetStorage();
		},

		resetStorage() {
			const userCookie = useCookie<UserState | null>(
				this.config.storageKey,
				{
					path: '/',
				},
			);
			userCookie.value = null;

			if (import.meta.client) {
				localStorage.removeItem(this.config.storageKey);
			}
		},
	},
});
