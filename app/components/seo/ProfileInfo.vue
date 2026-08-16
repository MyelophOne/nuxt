<script setup lang="ts">
interface Props {
	enabled?: boolean;
	context?: string;
	type?: string | string[];
	id?: string;
	url?: string;
	name?: string;
	headline?: string;
	description?: string;
	dateCreated?: string;
	dateModified?: string;
	datePublished?: string;
	inLanguage?: string | string[];
	image?: string | JsonLdNode | JsonLdValue[];
	isPartOf?: string | JsonLdNode;
	breadcrumb?: string | JsonLdNode;
	hasPart?: JsonLdNode | JsonLdValue[];
	about?: JsonLdNode | JsonLdValue[];
	author?: JsonLdNode | JsonLdValue[];
	publisher?: JsonLdNode;
	mainEntity?: JsonLdNode;
	entityOnly?: boolean;
	entity?: JsonLdNode;
	entityType?: "Person" | "Organization" | string;
	entityId?: string;
	entityName?: string;
	alternateName?: string | string[];
	identifier?: string | JsonLdNode | JsonLdValue[];
	entityDescription?: string;
	entityImage?: string | JsonLdNode | JsonLdValue[];
	entityUrl?: string;
	sameAs?: string[];
	jobTitle?: string;
	email?: string;
	telephone?: string;
	address?: string | JsonLdNode | JsonLdValue[];
	founder?: JsonLdNode | JsonLdValue[];
	owns?: JsonLdNode | JsonLdValue[];
	worksFor?: JsonLdNode | JsonLdValue[];
	knowsAbout?: string | JsonLdNode | JsonLdValue[];
	knowsLanguage?: string | JsonLdNode | JsonLdValue[];
	interactionStatistic?: JsonLdNode | JsonLdValue[];
	agentInteractionStatistic?: JsonLdNode | JsonLdValue[];
	graph?: JsonLdNode[];
	data?: JsonLdNode;
	scriptKey?: string;
	scriptId?: string;
}

const props = withDefaults(defineProps<Props>(), {
	enabled: true,
	context: "https://schema.org",
	type: "ProfilePage",
	entityType: "Person",
	entityOnly: false,
	entity: () => ({}),
	data: () => ({}),
});

const instanceId = useId();
const generatedEntity = computed<JsonLdNode>(() => ({
	...props.entity,
	"@type": props.entityType,
	...compactJsonLd({
		"@id": props.entityId ?? (props.entityOnly ? props.id : undefined),
		name: props.entityName ?? (props.entityOnly ? props.name : undefined),
		alternateName: props.alternateName,
		identifier: props.identifier,
		description:
			props.entityDescription ??
			(props.entityOnly ? props.description : undefined),
		image:
			props.entityImage ?? (props.entityOnly ? props.image : undefined),
		url: props.entityUrl ?? (props.entityOnly ? props.url : undefined),
		sameAs: props.sameAs,
		jobTitle: props.jobTitle,
		email: props.email,
		telephone: props.telephone,
		address: props.address,
		founder: props.founder,
		owns: props.owns,
		worksFor: props.worksFor,
		knowsAbout: props.knowsAbout,
		knowsLanguage: props.knowsLanguage,
		interactionStatistic: props.interactionStatistic,
		agentInteractionStatistic: props.agentInteractionStatistic,
	}),
}));

const schema = computed<JsonLdNode | null>(() => {
	if (!props.enabled) return null;
	if (props.entityOnly) {
		return wrapJsonLdGraph(
			{
				"@context": props.context,
				...generatedEntity.value,
			},
			props.graph,
		);
	}

	const record: JsonLdNode = {
		...props.data,
		"@context": props.context,
		"@type": props.type,
		...compactJsonLd({
			"@id": props.id,
			url: props.url,
			name: props.name,
			headline: props.headline,
			description: props.description,
			dateCreated: props.dateCreated,
			dateModified: props.dateModified,
			datePublished: props.datePublished,
			inLanguage: props.inLanguage,
			image: props.image,
			isPartOf: props.isPartOf,
			breadcrumb: props.breadcrumb,
			hasPart: props.hasPart,
			about: props.about,
			author: props.author,
			publisher: props.publisher,
			mainEntity: props.mainEntity ?? generatedEntity.value,
		}),
	};

	return wrapJsonLdGraph(record, props.graph);
});

useJsonLd(schema, {
	key: computed(() => props.scriptKey ?? `seo-profile-info-${instanceId}`),
	id: computed(() => props.scriptId),
});
</script>

<template />
