export function useLoadScript() {
	const loadedScripts = new Set<string>();

	const loadScript = (
		src: string,
		options: { async?: boolean; defer?: boolean; cache?: boolean } = {},
	) => {
		return new Promise<void>((resolve, reject) => {
			if (import.meta.server || loadedScripts.has(src)) {
				resolve();
				return;
			}

			const s = document.createElement('script');
			s.src =
				options.cache === false
					? `${src}?${(Date.now() / 60000) | 0}`
					: src;
			s.async = options.async ?? true;
			s.defer = options.defer ?? true;

			s.onload = () => {
				loadedScripts.add(src);
				resolve();
			};

			s.onerror = (err) => {
				reject(err);
			};

			document.body.appendChild(s);
		});
	};

	return { loadScript };
}
