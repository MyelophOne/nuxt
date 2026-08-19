export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:response', (response) => {
		if (
			typeof response.body === 'string' &&
			response.body.startsWith('<!DOCTYPE html>')
		) {
			response.body = response.body.replace(
				/<html\b[^>]*>/i,
				(htmlTag) => {
					return htmlTag.replace(/\s{2,}/g, ' ');
				},
			);
		}
	});
});
