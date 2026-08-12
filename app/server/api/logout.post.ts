export default defineEventHandler(async (event) => {
	deleteCookie(event, 'token', { path: '/' });
	deleteCookie(event, 'sessionExpiry', { path: '/' });

	return { success: true };
});
