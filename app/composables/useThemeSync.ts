type Theme = 'light' | 'dark';

const channelName = 'nuxt-theme-sync';

let channel: BroadcastChannel | null = null;
let initialized = false;

const isTheme = (value: unknown): value is Theme =>
	value === 'light' || value === 'dark';

const handleChannelMessage = (event: MessageEvent) => {
	if (event.data?.type === 'THEME_CHANGE' && isTheme(event.data.theme)) {
		applyTheme(event.data.theme, false);
	}
};

const handleStorage = (event: StorageEvent) => {
	if (event.key === 'theme' && isTheme(event.newValue)) {
		applyTheme(event.newValue, false);
	}
};

const initializeThemeSync = () => {
	if (!import.meta.client || initialized) return;

	initialized = true;

	if ('BroadcastChannel' in window) {
		try {
			channel = new BroadcastChannel(channelName);
			channel.addEventListener('message', handleChannelMessage);
		} catch (_error) {
			channel = null;
		}
	}

	window.addEventListener('storage', handleStorage);
};

const applyTheme = (theme: Theme, broadcast = true) => {
	if (!import.meta.client) return;

	initializeThemeSync();

	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.classList.remove('light', 'dark');
	document.documentElement.classList.add(theme);

	try {
		window.localStorage.setItem('theme', theme);
	} catch (_error) {
		const cookie = useCookie<Theme>('theme', {
			maxAge: 60 * 60 * 24 * 365,
		});
		cookie.value = theme;
	}

	if (broadcast && channel) {
		channel.postMessage({ type: 'THEME_CHANGE', theme });
	}
};

export const useThemeSync = () => {
	initializeThemeSync();

	return { applyTheme };
};

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		channel?.removeEventListener('message', handleChannelMessage);
		channel?.close();
		channel = null;

		if (import.meta.client && initialized) {
			window.removeEventListener('storage', handleStorage);
		}

		initialized = false;
	});
}
