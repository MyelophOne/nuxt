import {
	type CookiePreferences,
	type CookieSelection,
	COOKIE_CATEGORIES,
} from '~/types/cookie';

const defaultSelection = COOKIE_CATEGORIES.reduce(
	(acc, category) => {
		acc[category] = category === 'necessary';
		return acc;
	},
	{} as Record<string, boolean>,
) as CookieSelection;

const defaultCookiePrefs: CookiePreferences = {
	...defaultSelection,
	timestamp: 0,
	status: 'pending',
};

export const useSettingsStore = defineStore('settings', {
	state: () => ({
		isLoading: false,
		theme: 'light' as 'light' | 'dark',
		count: 0,
		currentLocale: '' as string,
		locales: [] as string[],
		defaultLocale: '' as string,
		cookiePreferences: { ...defaultCookiePrefs },
		isCookieBannerVisible: false,
	}),
	actions: {
		init() {
			const config = useMyelophoneConfig().multi18n;

			if (!config) {
				console.warn(
					'[multi18n] No myelophone config found for multi18n',
				);
				return;
			}

			this.defaultLocale = config.defaultLocale;
			this.locales = config.locales;
			this.currentLocale = config.defaultLocale;

			const route = useRoute();
			const segments = route.path.split('/');
			const urlPrefix = segments[1] ?? '';

			if (this.locales.includes(urlPrefix)) {
				this.currentLocale = urlPrefix;
			}
		},
		setIsLoading(isLoading: boolean) {
			this.isLoading = isLoading;
		},
		setTheme(theme: 'light' | 'dark') {
			this.theme = theme;

			const { applyTheme } = useThemeSync();
			applyTheme(theme);
		},
		loadTheme() {
			let saved: 'light' | 'dark' | null = null;
			try {
				const raw = window?.localStorage?.getItem('theme');
				if (raw === 'light' || raw === 'dark') {
					saved = raw;
				}
			} catch (_e) {
				const cookietheme = useCookie<'light' | 'dark' | null>('theme');
				if (
					cookietheme.value !== undefined &&
					cookietheme.value !== null
				) {
					saved = cookietheme.value;
				}
			}
			const prefersDark =
				window.matchMedia?.('(prefers-color-scheme: dark)').matches ??
				false;
			const theme: 'light' | 'dark' =
				saved || (prefersDark ? 'dark' : 'light');
			this.setTheme(theme);
		},
		toggleTheme() {
			const newTheme = this.theme === 'light' ? 'dark' : 'light';
			this.setTheme(newTheme);
		},
		increment() {
			this.count++;
		},
		updateLocaleFromRoute(path: string) {
			const segments = path.split('/');
			const prefix = segments[1] ?? '';
			this.currentLocale = this.locales.includes(prefix)
				? prefix
				: this.defaultLocale;
		},
		setLocale(locale: string) {
			if (!this.locales.includes(locale)) {
				console.warn(`[multi18n] Locale "${locale}" is not supported.`);
				return;
			}

			this.currentLocale = locale;

			const route = useRoute();
			const router = useRouter();
			const segments = route.path.split('/').filter(Boolean);

			const firstSegment = segments[0] ?? '';

			if (this.locales.includes(firstSegment)) {
				segments.shift();
			}

			if (locale !== this.defaultLocale) {
				segments.unshift(locale);
			}

			const newPath = '/' + segments.join('/');

			if (newPath !== route.path) {
				router.push({
					path: newPath,
					query: route.query ?? {},
					hash: route.hash ?? '',
				});
			}
		},
		setCookieConsent(prefs: CookiePreferences) {
			this.cookiePreferences = { ...prefs };
		},
		resetCookieConsent() {
			this.cookiePreferences = {
				...defaultCookiePrefs,
				necessary: true,
				timestamp: Date.now(),
				status: 'declined',
			};
		},
	},
});
