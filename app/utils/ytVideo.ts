export const getYoutubeEmbed = (val?: string) => {
	if (!val || val === 'none' || val.trim() === '') return null;

	const regExp =
		/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = val.match(regExp);
	const id = match && match[2] && match[2].length === 11 ? match[2] : val;

	if (!id) return null;

	const params = new URLSearchParams({
		autoplay: '1',
		mute: '1',
		controls: '0',
		loop: '1',
		playlist: id,
		playsinline: '1',
		rel: '0',
		modestbranding: '1',
		iv_load_policy: '3',
		autohide: '1',
		disablekb: '1',
		enablejsapi: '1',
	});

	return `https://www.youtube.com/embed/${id}?${params.toString()}`;
};

export const getYoutubePoster = (val?: string) => {
	if (!val || val === 'none') return '';
	const regExp =
		/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = val.match(regExp);
	const id = match && match[2] && match[2].length === 11 ? match[2] : val;

	return `url('https://img.youtube.com/vi/${id}/maxresdefault.jpg')`;
};
