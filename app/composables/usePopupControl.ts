export const usePopupControl = (
	popupId: string,
	daysUntilReappear: number = 7,
) => {
	const isOpen = useState<boolean>(`popup-state-${popupId}`, () => false);

	const outputCookie = useCookie(`popup-viewed-${popupId}`, {
		maxAge: 60 * 60 * 24 * daysUntilReappear,
		path: '/',
	});

	const open = (force: boolean = false) => {
		if (force) {
			isOpen.value = true;
		} else {
			if (!outputCookie.value) {
				isOpen.value = true;
			}
		}
	};

	const close = (persist: boolean = true) => {
		isOpen.value = false;
		if (persist) {
			outputCookie.value = new Date().toISOString();
		}
	};

	const reset = () => {
		outputCookie.value = null;
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (isOpen.value && e.key === 'Escape') {
			close(false);
		}
	};

	onMounted(() => {
		if (getCurrentInstance()) {
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onUnmounted(() => {
		if (getCurrentInstance()) {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	return {
		isOpen,
		open,
		close,
		reset,
	};
};
