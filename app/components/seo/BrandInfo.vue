<script setup lang="ts">
interface Props {
	enabled?: boolean;
	context?: string;
	type?: string | string[];
	id?: string;
	name?: string;
	alternateName?: string | string[];
	additionalType?: string | string[];
	description?: string;
	disambiguatingDescription?: string;
	url?: string;
	logo?: string | JsonLdNode;
	image?: string | JsonLdNode | JsonLdValue[];
	sameAs?: string[];
	identifier?: string | JsonLdNode | JsonLdValue[];
	slogan?: string;
	owner?: JsonLdNode | JsonLdValue[];
	aggregateRating?: JsonLdNode;
	review?: JsonLdNode | JsonLdValue[];
	mainEntityOfPage?: string | JsonLdNode;
	potentialAction?: JsonLdNode | JsonLdValue[];
	subjectOf?: JsonLdNode | JsonLdValue[];
	graph?: JsonLdNode[];
	data?: JsonLdNode;
	scriptKey?: string;
	scriptId?: string;
}

const props = withDefaults(defineProps<Props>(), {
	enabled: true,
	context: "https://schema.org",
	type: "Brand",
	data: () => ({}),
});

const instanceId = useId();
const schema = computed<JsonLdNode | null>(() => {
	if (!props.enabled) return null;

	const record: JsonLdNode = {
		...props.data,
		"@context": props.context,
		"@type": props.type,
		...compactJsonLd({
			"@id": props.id,
			name: props.name,
			alternateName: props.alternateName,
			additionalType: props.additionalType,
			description: props.description,
			disambiguatingDescription: props.disambiguatingDescription,
			url: props.url,
			logo: props.logo,
			image: props.image,
			sameAs: props.sameAs,
			identifier: props.identifier,
			slogan: props.slogan,
			owner: props.owner,
			aggregateRating: props.aggregateRating,
			review: props.review,
			mainEntityOfPage: props.mainEntityOfPage,
			potentialAction: props.potentialAction,
			subjectOf: props.subjectOf,
		}),
	};

	return wrapJsonLdGraph(record, props.graph);
});

useJsonLd(schema, {
	key: computed(() => props.scriptKey ?? `seo-brand-info-${instanceId}`),
	id: computed(() => props.scriptId),
});
</script>

<template />
