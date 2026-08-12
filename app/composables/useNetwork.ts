export const useNetwork = () => {
	const effectiveType = ref<string>('4g');
	const isSlowConnection = ref(false);
	const isOnline = ref(true);

	const updateStatus = () => {
		if (import.meta.server) return;
		isOnline.value = navigator.onLine;

		const conn =
			(navigator as any).connection ||
			(navigator as any).mozConnection ||
			(navigator as any).webkitConnection;

		if (conn) {
			effectiveType.value = conn.effectiveType;
			isSlowConnection.value =
				['slow-2g', '2g', '3g'].includes(conn.effectiveType) ||
				conn.saveData === true;
		}
	};

	if (import.meta.client) {
		updateStatus();

		const conn = (navigator as any).connection;

		const addListeners = () => {
			if (conn) conn.addEventListener('change', updateStatus);
			window.addEventListener('online', updateStatus);
			window.addEventListener('offline', updateStatus);
		};

		const removeListeners = () => {
			if (conn) conn.removeEventListener('change', updateStatus);
			window.removeEventListener('online', updateStatus);
			window.removeEventListener('offline', updateStatus);
		};

		if (getCurrentInstance()) {
			onMounted(addListeners);
			onUnmounted(removeListeners);
		} else {
			addListeners();
		}
	}

	return { effectiveType, isSlowConnection, isOnline };
};
