<script setup lang="ts">
interface Props {
	user: string;
	domain: string;
	tld?: string;
	subject?: string;
	class?: string;
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	tld: "com",
	placeholder: "[email hidden]",
});

const email = ref("");
const href = ref("");
const visible = ref(false);

onMounted(() => {
	const el = document.querySelector(
		`[data-email-user="${props.user}"][data-email-domain="${props.domain}"]`,
	) as HTMLElement | null;
	if (!el) return;

	const user = el.dataset.emailUser ?? "";
	const domain = el.dataset.emailDomain ?? "";
	const tld = el.dataset.emailTld ?? "";
	const full = `${user}@${domain}.${tld}`;

	email.value = full;
	href.value = `mailto:${full}${props.subject ? `?subject=${encodeURIComponent(props.subject)}` : ""}`;
	visible.value = true;
});
</script>

<template>
	<span
		v-if="!visible"
		:class="props.class"
		:data-email-user="props.user"
		:data-email-domain="props.domain"
		:data-email-tld="props.tld"
	>
		<noscript>[email&nbsp;protected]</noscript>
		{{ props.placeholder }}
	</span>

	<a v-else :href="href" :class="props.class" @click.stop>
		<slot>{{ email }}</slot>
	</a>
</template>
