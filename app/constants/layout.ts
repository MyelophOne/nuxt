export type LayoutSize =
	| 'fullwidth'
	| 'full'
	| 'tablet'
	| 'content'
	| 'boxed'
	| 'laptop'
	| 'medium'
	| 'mobile'
	| 'text';

export const BOXED_MAX_WIDTH = '1500px';

export const CONTAINER_MAX_WIDTH: Record<LayoutSize, string> = {
	fullwidth: 'max-w-full',
	full: 'max-w-full',
	tablet: 'max-w-[600px]',
	content: 'max-w-[1080px]',
	boxed: `max-w-[min(90%,${BOXED_MAX_WIDTH})]`,
	laptop: 'max-w-[1367px]',
	medium: 'max-w-[920px]',
	mobile: 'max-w-[480px]',
	text: 'max-w-[728px]',
};

export const CONTAINER_PADDING_X = 'px-4 md:px-0';

export const ROW_BASE = 'w-full flex flex-wrap';

export const FLEX_ALIGN = {
	start: 'items-start',
	center: 'items-center',
	end: 'items-end',
	stretch: 'items-stretch',
};

export const FLEX_JUSTIFY = {
	start: 'justify-start',
	center: 'justify-center',
	end: 'justify-end',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
};

export const COL_SPAN0 = {
	1: 'flex-none md:basis-1/12 basis-full',
	2: 'flex-none md:basis-2/12 basis-full',
	3: 'flex-none md:basis-3/12 basis-full',
	4: 'flex-none md:basis-4/12 basis-full',
	5: 'flex-none md:basis-5/12 basis-full',
	6: 'flex-none md:basis-6/12 basis-full',
	7: 'flex-none md:basis-7/12 basis-full',
	8: 'flex-none md:basis-8/12 basis-full',
	9: 'flex-none md:basis-9/12 basis-full',
	10: 'flex-none md:basis-10/12 basis-full',
	11: 'flex-none md:basis-11/12 basis-full',
	12: 'flex-none basis-full',
};

export const COL_SPAN = {
	1: 'flex-none md:basis-1/12',
	2: 'flex-none md:basis-2/12',
	3: 'flex-none md:basis-3/12',
	4: 'flex-none md:basis-4/12',
	5: 'flex-none md:basis-5/12',
	6: 'flex-none md:basis-6/12',
	7: 'flex-none md:basis-7/12',
	8: 'flex-none md:basis-8/12',
	9: 'flex-none md:basis-9/12',
	10: 'flex-none md:basis-10/12',
	11: 'flex-none md:basis-11/12',
	12: 'flex-none md:basis-12/12',
};

export const COL_SPAN_SM = {
	1: 'flex-none basis-1/12',
	2: 'flex-none basis-2/12',
	3: 'flex-none basis-3/12',
	4: 'flex-none basis-4/12',
	5: 'flex-none basis-5/12',
	6: 'flex-none basis-6/12',
	7: 'flex-none basis-7/12',
	8: 'flex-none basis-8/12',
	9: 'flex-none basis-9/12',
	10: 'flex-none basis-10/12',
	11: 'flex-none basis-11/12',
	12: 'flex-none basis-12/12',
};

export const COL_ORDER = {
	'1': 'order-1',
	'2': 'order-2',
	'3': 'order-3',
	'4': 'order-4',
	'5': 'order-5',
	'6': 'order-6',
	'7': 'order-7',
	'8': 'order-8',
	'9': 'order-9',
	'10': 'order-10',
	'11': 'order-11',
	'12': 'order-12',
	first: 'order-first',
	last: 'order-last',
	none: 'order-none',
} as const;

export type LayoutOrder = keyof typeof COL_ORDER;
