<script setup lang="ts">
import { getPost, renderMarkdown } from "#myelophone/app/utils/blog.server";

const props = defineProps<{
	slug: string;
}>();

const post = await getPost(props.slug);
const html = post ? renderMarkdown(post.content) : "";

if (post) {
	useAppSeo({
		title: post.meta.title,
		description: post.meta.description,
		image: post.meta.image,
	});
}
</script>

<template>
	<ViewNotFound v-if="!post" :set-response-status="false" />
	<article v-else class="post-content" v-html="html" />
</template>
