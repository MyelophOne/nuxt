interface GeoState {
	country: string;
	city: string;
	resolved: boolean;
}

interface GeoCacheData {
	country: string;
	city: string;
	timestamp: number;
}

interface WpFormsResponse {
	country_iso?: string;
	country_code?: string;
	city?: string;
	[key: string]: unknown;
}

interface CountryIsResponse {
	country?: string;
	[key: string]: unknown;
}

const CACHE_KEY = 'user-geo-data';
const CACHE_TTL = 30 * 60 * 1000;
const TIMEOUT_MS = 1000;

export const useGeoFetch = () => {
	const geo = useState<GeoState>('geo-data', () => ({
		country: '',
		city: '',
		resolved: false,
	}));

	const loadFromCache = (): GeoCacheData | null => {
		try {
			const item = sessionStorage.getItem(CACHE_KEY);
			if (!item) return null;

			const parsed = JSON.parse(item) as GeoCacheData;
			if (Date.now() - parsed.timestamp < CACHE_TTL) {
				return parsed;
			}
			return null;
		} catch {
			return null;
		}
	};

	const saveToCache = (country: string, city: string) => {
		try {
			const data: GeoCacheData = {
				country,
				city,
				timestamp: Date.now(),
			};
			sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
		} catch {}
	};

	const fetchWithTimeout = async <T>(url: string): Promise<T> => {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
		try {
			const res = await fetch(url, { signal: controller.signal });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return (await res.json()) as T;
		} finally {
			clearTimeout(id);
		}
	};

	const resolve = async () => {
		if (import.meta.server || geo.value.resolved) return;

		const cached = loadFromCache();
		if (cached) {
			geo.value = {
				country: cached.country,
				city: cached.city,
				resolved: true,
			};
			return;
		}

		onNuxtReady(async () => {
			let countryCode = '';
			let cityName = '';
			let isSuccess = false;

			try {
				const data = await fetchWithTimeout<WpFormsResponse>(
					'https://geo.wpforms.com/v3/geolocate/json',
				);

				const code = data.country_iso || data.country_code;

				if (code) {
					countryCode = code.toUpperCase();
					cityName = data.city || '';
					isSuccess = true;
				}
			} catch {
				try {
					const fallbackData =
						await fetchWithTimeout<CountryIsResponse>(
							'https://api.country.is/',
						);

					if (fallbackData.country) {
						countryCode = fallbackData.country.toUpperCase();
						cityName = '';
						isSuccess = true;
					}
				} catch {
					isSuccess = false;
				}
			}

			if (isSuccess && countryCode) {
				saveToCache(countryCode, cityName);

				geo.value = {
					country: countryCode,
					city: cityName,
					resolved: true,
				};
			} else {
				geo.value = {
					...geo.value,
					resolved: true,
				};
			}
		});
	};

	return { geo, resolve };
};
