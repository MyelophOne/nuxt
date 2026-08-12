export default defineNuxtPlugin((nuxtApp) => {
	const { isStaticMode } = useDevice();
	const { isSlowConnection } = useNetwork();

	if (import.meta.server) {
		nuxtApp.vueApp.directive('reveal', {
			getSSRProps: () => ({
				'data-v-reveal': '',
				class: isStaticMode.value ? 'is-visible' : '',
			}),
		});
		return;
	}

	const shouldSkipAnimation = computed(
		() => isStaticMode.value || isSlowConnection.value,
	);

	if (shouldSkipAnimation.value) {
		nuxtApp.vueApp.directive('reveal', {
			mounted(el: HTMLElement) {
				el.classList.add('is-visible');
			},
		});
		return;
	}

	let revealQueue: HTMLElement[] = [];
	let revealTimer: ReturnType<typeof setTimeout> | null = null;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const el = entry.target as HTMLElement;
				const isRepeat = (el as any)._revealRepeat;

				if (entry.isIntersecting) {
					if (el.classList.contains('is-visible')) return;

					revealQueue.push(el);
					if (revealTimer) clearTimeout(revealTimer);

					revealTimer = setTimeout(() => {
						revealQueue.forEach((item, index) => {
							const step = (item as any)._revealStep || 100;
							item.style.setProperty(
								'--reveal-delay',
								`${index * step}ms`,
							);
							requestAnimationFrame(() =>
								item.classList.add('is-visible'),
							);
						});
						revealQueue = [];
					}, 50);

					if (!isRepeat) observer.unobserve(el);
				} else {
					if (isRepeat && el.classList.contains('is-visible')) {
						el.classList.remove('is-visible');
						el.style.removeProperty('--reveal-delay');
					}
				}
			});
		},
		{
			rootMargin: '20px 0px 20px 0px',
			threshold: [0, 0.15],
		},
	);

	nuxtApp.vueApp.directive('reveal', {
		mounted(el: HTMLElement, binding) {
			const type = binding.arg || 'slide';
			(el as any)._revealStep =
				typeof binding.value === 'number' ? binding.value : 100;
			(el as any)._revealRepeat = !!binding.modifiers.repeat;

			el.classList.add('reveal-active', `reveal-${type}`);
			if (binding.modifiers.fast) el.classList.add('reveal-fast');
			if (binding.modifiers.slow) el.classList.add('reveal-slow');

			observer.observe(el);
		},
		unmounted(el: HTMLElement) {
			observer.unobserve(el);
		},
	});
});
