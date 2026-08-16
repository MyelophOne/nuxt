export type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue = JsonLdPrimitive | JsonLdNode | JsonLdValue[];

export interface JsonLdNode {
	[key: string]: JsonLdValue | undefined;
}

interface JsonLdHeadOptions {
	key: MaybeRefOrGetter<string>;
	id?: MaybeRefOrGetter<string | undefined>;
}

export const compactJsonLd = (value: JsonLdNode): JsonLdNode =>
	Object.fromEntries(
		Object.entries(value).filter(([, entry]) => entry !== undefined),
	);

export const wrapJsonLdGraph = (
	record: JsonLdNode,
	graph?: JsonLdNode[],
): JsonLdNode => {
	if (!graph) return record;

	const { '@context': context = 'https://schema.org', ...node } = record;
	return {
		'@context': context,
		'@graph': [node, ...graph],
	};
};

export const serializeJsonLd = (value: JsonLdNode): string =>
	JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');

export const useJsonLd = (
	schema: MaybeRefOrGetter<JsonLdNode | null>,
	options: JsonLdHeadOptions,
) => {
	useHead(() => {
		const value = toValue(schema);
		if (!value) return { script: [] };

		return {
			script: [
				{
					key: toValue(options.key),
					id: options.id ? toValue(options.id) : undefined,
					type: 'application/ld+json',
					innerHTML: serializeJsonLd(value),
				},
			],
		};
	});
};
