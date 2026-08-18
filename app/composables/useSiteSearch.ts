import { UI_SITE_SEARCH_OPEN_EVENT } from '~/constants/ui-events';

export function openSiteSearch(preset = '', immediate = true) {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(
			new CustomEvent(UI_SITE_SEARCH_OPEN_EVENT, {
				detail: { preset, immediate },
			}),
		);
	}
}

export function closeSiteSearch() {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('myelophone:site-search-close'));
	}
}

export function useSiteSearch() {
	const open = (preset = '', immediate = true) => {
		openSiteSearch(preset, immediate);
	};

	const close = () => {
		closeSiteSearch();
	};

	return {
		open,
		close,
	};
}
