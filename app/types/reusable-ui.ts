export interface GalleryImage {
	src: string;
	alt?: string;
	title?: string;
	width?: number;
	height?: number;
	sizes?: string;
}

export interface SelectDialogOption {
	value: string | number;
	label: string;
	description?: string;
	disabled?: boolean;
}

export interface ValueListItem {
	id: string;
	label: string;
	value: string | number;
}

export interface BarChartItem {
	id: string;
	label: string;
	value: number;
}

export interface ExchangeRateItem {
	code: string;
	rate: number;
	scale?: number;
	date?: string;
}
