export default defineEventHandler((event) => {
	const originalPath = event.path || '/';
	let normalized = originalPath;

	normalized = normalized.replace(/\/{2,}/g, '/');

	if (normalized.length > 1 && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1);
	}

	if (normalized !== originalPath) {
		return sendRedirect(event, normalized, 301);
	}
});
