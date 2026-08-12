const activeModals = ref<string[]>([]);

export const useModalState = () => {
	const register = (id: string) => {
		if (!activeModals.value.includes(id)) {
			activeModals.value.push(id);
		}
	};

	const unregister = (id: string) => {
		activeModals.value = activeModals.value.filter((m) => m !== id);
	};

	const isTop = (id: string) => {
		return activeModals.value[activeModals.value.length - 1] === id;
	};

	watch(
		() => activeModals.value.length,
		(count) => {
			if (import.meta.client) {
				if (count > 0) {
					document.body.style.overflow = 'hidden';
				} else {
					document.body.style.overflow = '';
				}
			}
		},
	);

	return {
		activeModals,
		register,
		unregister,
		isTop,
	};
};
