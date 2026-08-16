<script setup lang="ts">
interface Props {
	enabled?: boolean;
	context?: string;
	type?: string | string[];
	id?: string;
	name?: string;
	alternateName?: string | string[];
	legalName?: string;
	description?: string;
	url?: string;
	logo?: string | JsonLdNode;
	image?: string | JsonLdNode | JsonLdValue[];
	sameAs?: string[];
	email?: string;
	telephone?: string;
	address?: string | JsonLdNode | JsonLdValue[];
	contactPoint?: JsonLdNode | JsonLdValue[];
	founder?: JsonLdNode | JsonLdValue[];
	foundingDate?: string;
	foundingLocation?: string | JsonLdNode;
	employee?: JsonLdNode | JsonLdValue[];
	numberOfEmployees?: number | JsonLdNode;
	parentOrganization?: JsonLdNode;
	subOrganization?: JsonLdNode | JsonLdValue[];
	department?: JsonLdNode | JsonLdValue[];
	member?: JsonLdNode | JsonLdValue[];
	memberOf?: JsonLdNode | JsonLdValue[];
	owns?: JsonLdNode | JsonLdValue[];
	brand?: JsonLdNode | JsonLdValue[];
	slogan?: string;
	areaServed?: string | JsonLdNode | JsonLdValue[];
	award?: string | string[];
	knowsAbout?: string | JsonLdNode | JsonLdValue[];
	keywords?: string | string[];
	taxID?: string;
	vatID?: string;
	duns?: string;
	globalLocationNumber?: string;
	iso6523Code?: string;
	leiCode?: string;
	naics?: string;
	nonprofitStatus?: string;
	aggregateRating?: JsonLdNode;
	review?: JsonLdNode | JsonLdValue[];
	makesOffer?: JsonLdNode | JsonLdValue[];
	seeks?: JsonLdNode | JsonLdValue[];
	hasOfferCatalog?: JsonLdNode;
	hasMerchantReturnPolicy?: JsonLdNode | JsonLdValue[];
	hasShippingService?: JsonLdNode | JsonLdValue[];
	graph?: JsonLdNode[];
	data?: JsonLdNode;
	scriptKey?: string;
	scriptId?: string;
}

const props = withDefaults(defineProps<Props>(), {
	enabled: true,
	context: "https://schema.org",
	type: "Organization",
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
			legalName: props.legalName,
			description: props.description,
			url: props.url,
			logo: props.logo,
			image: props.image,
			sameAs: props.sameAs,
			email: props.email,
			telephone: props.telephone,
			address: props.address,
			contactPoint: props.contactPoint,
			founder: props.founder,
			foundingDate: props.foundingDate,
			foundingLocation: props.foundingLocation,
			employee: props.employee,
			numberOfEmployees: props.numberOfEmployees,
			parentOrganization: props.parentOrganization,
			subOrganization: props.subOrganization,
			department: props.department,
			member: props.member,
			memberOf: props.memberOf,
			owns: props.owns,
			brand: props.brand,
			slogan: props.slogan,
			areaServed: props.areaServed,
			award: props.award,
			knowsAbout: props.knowsAbout,
			keywords: props.keywords,
			taxID: props.taxID,
			vatID: props.vatID,
			duns: props.duns,
			globalLocationNumber: props.globalLocationNumber,
			iso6523Code: props.iso6523Code,
			leiCode: props.leiCode,
			naics: props.naics,
			nonprofitStatus: props.nonprofitStatus,
			aggregateRating: props.aggregateRating,
			review: props.review,
			makesOffer: props.makesOffer,
			seeks: props.seeks,
			hasOfferCatalog: props.hasOfferCatalog,
			hasMerchantReturnPolicy: props.hasMerchantReturnPolicy,
			hasShippingService: props.hasShippingService,
		}),
	};

	return wrapJsonLdGraph(record, props.graph);
});

useJsonLd(schema, {
	key: computed(() => props.scriptKey ?? `seo-org-info-${instanceId}`),
	id: computed(() => props.scriptId),
});
</script>

<template />
