export function googleMapsEmbedUrl(value: string): string {
	try {
		const url = new URL(value);
		if (
			url.protocol !== 'https:' ||
			url.username ||
			url.password ||
			url.port
		)
			return '';
		if (!['www.google.com', 'maps.google.com'].includes(url.hostname))
			return '';
		return /^\/maps\/(embed|d\/(?:u\/\d+\/)?embed)(\/|$)/.test(
			url.pathname,
		) ||
			(url.pathname === '/maps' &&
				url.searchParams.get('output') === 'embed')
			? url.href
			: '';
	} catch {
		return '';
	}
}

export function isUiDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T12:00:00Z`);
	return (
		Number.isFinite(date.getTime()) &&
		date.toISOString().slice(0, 10) === value
	);
}

export function cleanUiPhone(value: string): string {
	let digits = 0;
	return value
		.replace(/[^0-9+() \-]/g, '')
		.replace(/^ +/, '')
		.split('')
		.filter((char, index) =>
			char === '+'
				? index === 0
				: /[0-9]/.test(char)
					? ++digits <= 15
					: true,
		)
		.join('')
		.slice(0, 40);
}
