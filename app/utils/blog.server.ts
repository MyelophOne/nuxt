import { posts as generatedPosts } from 'virtual:myelophone-blog-content';

export interface PostMeta {
	title?: string;
	description?: string;
	image?: string;
}

export interface Post {
	meta: PostMeta;
	html: string;
}

export async function getPost(slug: string): Promise<Post | null> {
	return generatedPosts[slug] ?? null;
}
