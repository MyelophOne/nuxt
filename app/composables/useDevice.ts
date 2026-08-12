const batteryLevel = ref(1);
const isLowBattery = ref(false);
let isBatteryListenerActive = false;

const initBatteryListener = async () => {
	if (!import.meta.client || isBatteryListenerActive) return;

	if (
		'getBattery' in navigator &&
		typeof (navigator as any).getBattery === 'function'
	) {
		try {
			const batt: any = await (navigator as any).getBattery();
			isBatteryListenerActive = true;

			const updateStatus = () => {
				batteryLevel.value = batt.level;
				isLowBattery.value = batt.level <= 0.2 && !batt.charging;
			};

			updateStatus();

			if (typeof batt.addEventListener === 'function') {
				batt.addEventListener('levelchange', updateStatus);
				batt.addEventListener('chargingchange', updateStatus);
			} else {
				batt.onlevelchange = updateStatus;
				batt.onchargingchange = updateStatus;
			}
		} catch (e) {
			console.warn('Battery API error:', e);
		}
	}
};

export const useDevice = () => {
	initBatteryListener();

	const headers = useRequestHeaders(['user-agent']);

	const getUA = () => {
		if (import.meta.server) return headers['user-agent'] || '';
		return navigator.userAgent || '';
	};

	const isOutdated = computed(() => {
		if (import.meta.server) return false;
		const ua = getUA();
		if (!ua) return false;

		const chromeMatch = ua.match(/(?:Chrome|CriOS)\/(\d+)\./);
		if (chromeMatch?.[1] && parseInt(chromeMatch[1], 10) < 85) return true;

		const safariMatch = ua.match(/Version\/(\d+)\..*Safari/);
		if (safariMatch?.[1] && parseInt(safariMatch[1], 10) < 14) return true;

		const firefoxMatch = ua.match(/Firefox\/(\d+)\./);
		if (firefoxMatch?.[1] && parseInt(firefoxMatch[1], 10) < 80)
			return true;

		if (/MSIE|Trident/i.test(ua)) return true;

		if (import.meta.client) {
			const supportsNuxt4 =
				'noModule' in HTMLScriptElement.prototype &&
				typeof Promise?.allSettled === 'function' &&
				typeof BigInt !== 'undefined' &&
				'replaceAll' in String.prototype;

			if (!supportsNuxt4) return true;
		}
		return false;
	});

	const isBot = computed(() => {
		return /bot|googlebot|crawler|spider|robot|crawling|lighthouse|inspect/i.test(
			getUA(),
		);
	});

	const isMobile = computed(() => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			getUA(),
		);
	});

	const prefersReducedMotion = computed(() => {
		if (import.meta.server) return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const isStaticMode = computed(
		() =>
			isBot.value ||
			prefersReducedMotion.value ||
			isLowBattery.value ||
			isOutdated.value,
	);

	return {
		isBot,
		isOutdated,
		isMobile,
		isStaticMode,
		isLowBattery,
		batteryLevel,
		prefersReducedMotion,
	};
};
