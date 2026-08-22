import {
	type CookiePreferences,
	type CookieSelection,
	COOKIE_CATEGORIES,
} from '~/types/cookie';

export const useCookieControl = () => {
	const store = useSettingsStore();
	const { cookiePreferences, isCookieBannerVisible } = storeToRefs(store);

	const config = useMyelophoneConfig();
	const isEnabled = config.cookieControl?.enabled ?? true;

	const nuxtCookie = useCookie<CookiePreferences | undefined>(
		'privacy-preferences',
		{
			maxAge: 60 * 60 * 24 * 365,
		},
	);

	const initCookieConsent = () => {
		if (!isEnabled) {
			store.isCookieBannerVisible = false;
			return;
		}

		if (nuxtCookie.value && nuxtCookie.value.status) {
			store.setCookieConsent(nuxtCookie.value);
		}

		const { status, timestamp } = store.cookiePreferences;

		if (status === 'pending') {
			store.isCookieBannerVisible = true;
		} else if (status === 'declined') {
			const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
			if (Date.now() - timestamp > thirtyDaysMs) {
				store.isCookieBannerVisible = true;
			} else {
				store.isCookieBannerVisible = false;
			}
		} else {
			store.isCookieBannerVisible = false;
		}
	};

	if (import.meta.client) {
		watch(
			() => store.cookiePreferences,
			(newVal) => {
				nuxtCookie.value = newVal;
			},
			{ deep: true },
		);
	}

	const acceptAll = () => {
		const allAccepted = COOKIE_CATEGORIES.reduce((acc, cat) => {
			acc[cat] = true;
			return acc;
		}, {} as CookieSelection);

		store.setCookieConsent({
			...allAccepted,
			timestamp: Date.now(),
			status: 'accepted',
		});
		store.isCookieBannerVisible = false;
	};

	const declineAll = () => {
		const allDeclined = COOKIE_CATEGORIES.reduce((acc, cat) => {
			acc[cat] = cat === 'necessary';
			return acc;
		}, {} as CookieSelection);

		store.setCookieConsent({
			...allDeclined,
			timestamp: Date.now(),
			status: 'declined',
		});
		store.isCookieBannerVisible = false;
	};

	const savePreferences = (prefs: Partial<CookieSelection>) => {
		store.setCookieConsent({
			...store.cookiePreferences,
			...prefs,
			necessary: true,
			timestamp: Date.now(),
			status: 'accepted',
		});
		store.isCookieBannerVisible = false;
	};

	const checkConsent = (category: keyof CookiePreferences) => {
		if (!store.cookiePreferences) return false;
		return store.cookiePreferences[category] === true;
	};

	return {
		cookiePreferences,
		isBannerVisible: isCookieBannerVisible,

		initCookieConsent,
		acceptAll,
		declineAll,
		savePreferences,
		checkConsent,
	};
};
