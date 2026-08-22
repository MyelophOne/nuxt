<script setup lang="ts">
export interface TallyOptions {
	hideTitle?: boolean;
	transparentBackground?: boolean;
	dynamicHeight?: boolean;
	alignLeft?: boolean;
	overlay?: boolean;
	emoji?: { text: string; animation: string };
	autoClose?: number;
	doNotShowAfterSubmit?: boolean;
	[key: string]: any;
}

export interface TallyColors {
	light?: { bg?: string; text?: string };
	dark?: { bg?: string; text?: string };
}

interface Props {
	formId: string;
	mode?: "standard" | "popup" | "fullscreen";
	domain?: string;
	initialHeight?: number | string;
	hiddenFields?: Record<string, any>;
	options?: TallyOptions;
	colors?: TallyColors;
	popupWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
	mode: "standard",
	initialHeight: 400,
	hiddenFields: () => ({}),
	options: () => ({}),
	colors: () => ({}),
	popupWidth: 900,
});

const iframeId = `tally-${Math.random().toString(36).slice(2, 11)}`;

const config = useMyelophoneConfig();
const rawDomain = props.domain || config.tally?.domain || "tally.so";
const baseUrl = `https://${rawDomain}`;
const scriptSrc = `${baseUrl}/widgets/embed.js`;

const settingsStore = useSettingsStore();
const currentTheme = computed(() => settingsStore.theme || "light");

const getPayload = (isFullscreenOverride = false) => {
	const payload: Record<string, any> = {
		transparentBackground: 1,
		dynamicHeight: isFullscreenOverride ? 0 : 1,
		...props.options,
	};

	if (props.colors.light?.bg) payload.lightbg = props.colors.light.bg;
	if (props.colors.light?.text) payload.lighttext = props.colors.light.text;
	if (props.colors.dark?.bg) payload.darkbg = props.colors.dark.bg;
	if (props.colors.dark?.text) payload.darktext = props.colors.dark.text;

	payload.theme = currentTheme.value;
	if (props.hiddenFields) Object.assign(payload, props.hiddenFields);

	return payload;
};

const generateUrl = (includeTheme: boolean) => {
	const urlParams = new URLSearchParams();
	const payload = getPayload(false);
	if (!includeTheme) delete payload.theme;

	Object.entries(payload).forEach(([key, value]) => {
		if (
			typeof value === "boolean" &&
			props.options &&
			key in props.options
		) {
			urlParams.set(key, value ? "1" : "0");
		} else if (value !== undefined && value !== null) {
			urlParams.set(key, String(value));
		}
	});
	return `${baseUrl}/embed/${props.formId}?${urlParams.toString()}`;
};

const staticUrl = computed(() => generateUrl(false));
const fullUrl = computed(() => generateUrl(true));

const { load, status } = useScript(scriptSrc, {
	trigger: "manual",
	use() {
		return { Tally: (window as any).Tally };
	},
});

const getTallyApi = async () => {
	if ((window as any).Tally) return (window as any).Tally;
	if (status.value !== "loading" && status.value !== "loaded") load();

	return new Promise((resolve) => {
		let attempts = 0;
		const check = setInterval(() => {
			attempts++;
			if ((window as any).Tally) {
				clearInterval(check);
				resolve((window as any).Tally);
			}
			if (attempts > 50) {
				clearInterval(check);
				resolve(null);
			}
		}, 100);
	});
};

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeLoaded = ref(false);

onMounted(() => {
	if (props.mode === "standard") getTallyApi();
});

const onIframeLoad = async () => {
	iframeLoaded.value = true;
	updateThemeInIframe(iframeRef.value?.contentWindow);

	const Tally = await getTallyApi();
	if (Tally?.loadEmbeds) {
		setTimeout(() => {
			Tally.loadEmbeds();
		}, 200);
	}
};

const openPopup = async () => {
	const Tally = await getTallyApi();
	if (!Tally) return;

	const isFullscreen = props.mode === "fullscreen";
	const payload = getPayload(isFullscreen);

	const popupOptions = {
		layout: isFullscreen ? "modal" : "default",
		width: isFullscreen ? 10000 : undefined,
		...payload,
	};

	if (isFullscreen) {
		document.body.classList.add("tally-fullscreen-mode");
	} else {
		document.body.classList.remove("tally-fullscreen-mode");
	}

	setTimeout(() => {
		Tally.openPopup(props.formId, popupOptions);
		setTimeout(syncPopupTheme, 300);
	}, 50);
};

const updateThemeInIframe = (w: Window | null | undefined) => {
	w?.postMessage({ type: "setTheme", theme: currentTheme.value }, "*");
};
const syncPopupTheme = () => {
	const popupFrame = document.querySelector(
		".tally-popup iframe",
	) as HTMLIFrameElement;
	updateThemeInIframe(popupFrame?.contentWindow);
};
watch(currentTheme, () => {
	props.mode === "standard"
		? updateThemeInIframe(iframeRef.value?.contentWindow)
		: syncPopupTheme();
});

defineExpose({ open: openPopup });
</script>

<template>
	<component
		:is="mode === 'standard' ? 'div' : 'span'"
		class="tally-component-wrapper"
		:class="{ 'cursor-pointer': mode !== 'standard' }"
		@click="mode !== 'standard' && openPopup()"
	>
		<ClientOnly v-if="mode === 'standard'">
			<div
				class="relative w-full overflow-hidden"
				:style="{
					minHeight: iframeLoaded ? undefined : `${initialHeight}px`,
				}"
			>
				<div
					v-if="!iframeLoaded"
					class="absolute inset-0 z-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900"
					style="background-color: var(--ui-bg)"
				>
					<a
						:href="staticUrl"
						target="_blank"
						class="text-sm underline opacity-60"
						>Загрузка...</a
					>
				</div>

				<iframe
					ref="iframeRef"
					:id="iframeId"
					:src="fullUrl"
					class="relative z-10 w-full border-0 transition-opacity duration-500"
					:class="iframeLoaded ? 'opacity-100' : 'opacity-0'"
					loading="lazy"
					width="100%"
					height="100%"
					title="Form"
					@load="onIframeLoad"
				/>
			</div>
			<template #fallback>
				<div
					class="relative w-full flex items-center justify-center"
					:style="{
						height: `${initialHeight}px`,
						backgroundColor: 'var(--ui-bg)',
					}"
				>
					<a
						:href="staticUrl"
						target="_blank"
						class="text-sm underline opacity-60"
						>Открыть форму</a
					>
				</div>
			</template>
		</ClientOnly>
		<slot v-else />
	</component>
</template>

<style scoped>
.tally-component-wrapper {
	display: inherit;
	cursor: auto !important;
}
:deep(iframe) {
	cursor: auto !important;
}
</style>

<style>
body.tally-fullscreen-mode .tally-overlay {
	z-index: 2147483647 !important;
	padding: 0 !important;
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
	background-color: transparent !important;
}

body.tally-fullscreen-mode .tally-overlay .tally-popup {
	width: 100vw !important;
	height: 100vh !important;
	max-width: none !important;
	max-height: none !important;
	border-radius: 0 !important;
	margin: 0 !important;
	top: 0 !important;
	left: 0 !important;
	background-color: var(--ui-bg, #fff) !important;
	display: flex !important;
	flex-direction: column !important;
}

body.tally-fullscreen-mode .tally-overlay .tally-popup iframe {
	width: 100% !important;
	height: 100% !important;
	flex: 1 !important;
	min-height: 100vh !important;
	border-radius: 0 !important;
}

body.tally-fullscreen-mode .tally-overlay .tally-close {
	position: fixed !important;
	top: 24px !important;
	right: 24px !important;
	color: var(--ui-text, #000) !important;
	background: rgba(127, 127, 127, 0.2) !important;
	border-radius: 50% !important;
	z-index: 2147483648 !important;
	width: 40px !important;
	height: 40px !important;
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
}
</style>
