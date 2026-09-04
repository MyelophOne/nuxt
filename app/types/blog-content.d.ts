declare module 'virtual:myelophone-blog-content' {
	const posts: Record<
		string,
		{
			meta: Record<string, string>;
			html: string;
		}
	>;

	export { posts };
}
