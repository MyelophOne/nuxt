import { defineStore } from 'pinia';

export const useQuerySyncStore = defineStore('query-sync', {
	state: () => ({ records: {} as Record<string, unknown> }),
});
