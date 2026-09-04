export default defineEventHandler((event) => {
	if (event.method === 'OPTIONS') {
		event.node.res.statusCode = 204;
		return '';
	}

	const url = new URL(
		event.node.req.url || '/',
		`http://${event.node.req.headers.host}`,
	);

	if (
		url.pathname.startsWith('/_nuxt/') ||
		url.pathname.startsWith('/__nuxt_')
	) {
		return;
	}

	const sanitize = (path: string) => {
		let p = path
			.replace(/[<>{}|\\^`]/g, '')
			.replace(/\/+/g, '/')
			.replace(/\.\.\//g, '')
			.replace(/\.\./g, '');
		if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
		return encodeURI(decodeURI(p)).toLowerCase();
	};

	const isLocalhost = (host: string) => {
		return (
			host.startsWith('localhost') ||
			host.startsWith('127.') ||
			host.startsWith('192.168.') ||
			host.startsWith('::1') ||
			/^[\d.]+$/.test(host)
		);
	};

	const sanitizedPath = sanitize(url.pathname);
	const isWww = url.hostname.startsWith('www.');
	const finalHost = isWww ? url.hostname.replace(/^www\./, '') : url.hostname;
	const needsHttps = !isLocalhost(finalHost) && url.protocol !== 'https:';
	const port = url.port ? `:${url.port}` : '';

	if (sanitizedPath !== url.pathname || isWww) {
		const protocol = !needsHttps ? url.protocol : 'https:';
		const newUrl = `${protocol}//${finalHost}${port}${sanitizedPath}${url.search}${url.hash}`;
		return sendRedirect(event, newUrl, 301);
	}
});
