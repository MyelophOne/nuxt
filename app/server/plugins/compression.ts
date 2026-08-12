import { useCompression } from 'h3-compression';

interface CompressionSettings {
	brotli?: boolean | object;
	gzip?: boolean | object;
	body?: unknown;
}

type LibOptions = Parameters<typeof useCompression>[1];

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook('render:response', async (response, { event }) => {
		if (import.meta.dev || event.req.method !== 'GET') {
			return;
		}

		const contentType =
			response.headers?.['content-type'] ||
			event.runtime!.node!.res!.getHeader('content-type');

		if (
			typeof contentType === 'string' &&
			contentType.includes('text/html')
		) {
			const compressionOptions: LibOptions & CompressionSettings = {
				brotli: true,
				gzip: true,
				body: response.body,
			};

			await useCompression(event, compressionOptions);
		}
	});
});
