type DeviceType = 'mobile' | 'tablet' | 'desktop';
type Orientation = 'portrait' | 'landscape' | '';

interface NetworkInfo {
	effectiveType?: string;
	saveData?: boolean;
	addEventListener?: (event: 'change', listener: () => void) => void;
	removeEventListener?: (event: 'change', listener: () => void) => void;
}

function detectDevice(): DeviceType {
	if (import.meta.server) return 'desktop';

	const ua = navigator.userAgent.toLowerCase();
	const width = window.innerWidth;
	const height = window.innerHeight;
	const dpr = window.devicePixelRatio || 1;
	const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	const orientation = width > height ? 'landscape' : 'portrait';

	const isMobileUA = /mobi|iphone|ipod|android.*mobile|windows phone/i.test(
		ua,
	);
	const isTabletUA = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
	const isDesktopUA = !isMobileUA && !isTabletUA;

	if (isMobileUA) return 'mobile';
	if (isTabletUA) return 'tablet';

	if (isTouch) {
		if (width < 768 || (width < 1024 && dpr > 1.5)) return 'mobile';
		if (width >= 768 && width <= 1200) return 'tablet';
	}

	if (orientation === 'portrait') {
		if (width < 768) return 'mobile';
		if (width >= 768 && width <= 1024) return 'tablet';
	}

	if (isDesktopUA) return 'desktop';

	return 'desktop';
}

function detectOS(userAgent: string): string {
	if (/windows/i.test(userAgent)) return 'Windows';
	if (/mac os/i.test(userAgent)) return 'macOS';
	if (/android/i.test(userAgent)) return 'Android';
	if (/ios|iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
	if (/linux/i.test(userAgent)) return 'Linux';
	return 'Unknown';
}

function detectBrowser(userAgent: string): string {
	const ua = userAgent.toLowerCase();
	if (/edg/i.test(ua)) return 'Edge';
	if (/opr|opera/i.test(ua)) return 'Opera';
	if (/chrome|crios/i.test(ua) && !/edg/i.test(ua) && !/opr/i.test(ua))
		return 'Chrome';
	if (/safari/i.test(ua) && !/chrome|crios|opr|edg/i.test(ua))
		return 'Safari';
	if (/firefox|fxios/i.test(ua)) return 'Firefox';
	if (/msie|trident/i.test(ua)) return 'Internet Explorer';
	if (/ucbrowser/i.test(ua)) return 'UC Browser';
	if (/samsungbrowser/i.test(ua)) return 'Samsung Browser';
	if (/qqbrowser/i.test(ua)) return 'QQ Browser';
	if (/baidubrowser/i.test(ua)) return 'Baidu Browser';
	if (/yabrowser/i.test(ua)) return 'Yandex Browser';
	if (/vivaldi/i.test(ua)) return 'Vivaldi';
	if (/brave/i.test(ua)) return 'Brave';
	return 'Unknown';
}

export const useDeviceStore = defineStore('device', {
	state: () => ({
		type: '' as DeviceType,
		os: '',
		browser: '',
		isTouch: false,
		width: 0,
		height: 0,
		dpr: 1,
		orientation: '' as Orientation,
		connectionType: '' as string,
		saveData: false,
		language: '',
	}),
	actions: {
		setDeviceInfo(init = false) {
			if (import.meta.server) return;

			const width = window.innerWidth;
			const height = window.innerHeight;
			const ua = navigator.userAgent;
			const dpr = window.devicePixelRatio || 1;
			const isTouch =
				'ontouchstart' in window || navigator.maxTouchPoints > 0;

			if (init) {
				this.type = detectDevice();
			}

			this.os = detectOS(ua);
			this.browser = detectBrowser(ua);
			this.isTouch = isTouch;
			this.width = width;
			this.height = height;
			this.dpr = dpr;
			this.orientation = width > height ? 'landscape' : 'portrait';
			this.language = navigator.language || '';
		},

		updateNetworkInfo() {
			const update = () => {
				const navConn = (
					navigator as unknown as { connection?: NetworkInfo }
				).connection;
				if (navConn) {
					this.connectionType = navConn.effectiveType ?? '';
					this.saveData = navConn.saveData ?? false;
				}
			};

			if ('requestIdleCallback' in window) {
				// biome-ignore lint/suspicious/noExplicitAny: required fix
				(window as any).requestIdleCallback(update);
			} else {
				setTimeout(update, 0);
			}

			const navConn = (
				navigator as unknown as { connection?: NetworkInfo }
			).connection;
			if (navConn?.addEventListener) {
				const listener = () => this.updateNetworkInfo();
				navConn.addEventListener('change', listener);
			}
		},

		initDeviceDetection() {
			if (import.meta.server) return;

			const resizeHandler = () => this.setDeviceInfo();

			onMounted(() => {
				this.setDeviceInfo(true);
				window.addEventListener('resize', resizeHandler);
				this.updateNetworkInfo();
			});

			onBeforeUnmount(() => {
				window.removeEventListener('resize', resizeHandler);
			});
		},
	},
});
