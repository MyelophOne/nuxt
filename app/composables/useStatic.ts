export const useStatic = () => {
	return computed(() => {
		return process.env.NUXT_STATIC === 'true';
	});
};
