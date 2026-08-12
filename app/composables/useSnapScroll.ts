const resetRegistry = new Set<() => void>();

export const useSnapScroll = () => {
	const registerContainer = (resetFn: () => void) => {
		onMounted(() => {
			resetRegistry.add(resetFn);
		});
		onUnmounted(() => {
			resetRegistry.delete(resetFn);
		});
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });

		resetRegistry.forEach((reset) => {
			try {
				reset();
			} catch (e) {}
		});
	};

	return { registerContainer, scrollToTop };
};
