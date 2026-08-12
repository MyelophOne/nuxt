import { version } from 'nuxt/package.json';

export function useNuxtVersion() {
	return version || 'v4.x';
}
