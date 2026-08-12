export const useThemeSync = () => {
	const channelName = 'nuxt-theme-sync';
	let channel: BroadcastChannel | null = null;

	if (import.meta.client) {
		channel = new BroadcastChannel(channelName);

		channel.onmessage = (event) => {
			if (event.data?.type === 'THEME_CHANGE' && event.data.theme) {
				applyTheme(event.data.theme, false);
			}
		};

		window.addEventListener('storage', (e) => {
			if (e.key === 'theme' && e.newValue) {
				applyTheme(e.newValue as 'light' | 'dark', false);
			}
		});
	}

	const applyTheme = (theme: 'light' | 'dark', broadcast = true) => {
		document.documentElement.setAttribute('data-theme', theme);
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(theme);

		try {
			window?.localStorage?.setItem('theme', theme);
		} catch (_e) {
			const cookie = useCookie('theme', { maxAge: 60 * 60 * 24 * 365 });
			cookie.value = theme;
		}

		if (broadcast && channel) {
			channel.postMessage({ type: 'THEME_CHANGE', theme });
		}
	};

	return { applyTheme };
};
