import { addComponent, addTemplate, defineNuxtModule } from '@nuxt/kit';

interface FullscreenPreloaderConfig {
	component?: string;
}

const COMPONENT_NAME_PATTERN = /^[A-Z][A-Za-z0-9_]*$/;

export default defineNuxtModule({
	meta: {
		name: '@myelophone/nuxt-fullscreen-preloader',
	},
	setup(_options, nuxt) {
		const configured = nuxt.options.runtimeConfig.public
			.pageFullscreenPreloader as FullscreenPreloaderConfig | undefined;

		const componentName = configured?.component;

		const validComponentName =
			componentName && COMPONENT_NAME_PATTERN.test(componentName)
				? componentName
				: undefined;

		if (componentName && !validComponentName) {
			console.warn(
				`[pageFullscreenPreloader] Ignored invalid component name: ${componentName}`,
			);
		}

		const wrapper = addTemplate({
			filename: 'myelophone/fullscreen-preloader-content.vue',
			getContents: () =>
				validComponentName
					? `<template><${validComponentName} v-bind="$attrs" /></template>\n`
					: '<template></template>\n',
		});

		addComponent({
			name: 'PageFullscreenPreloaderConfiguredContent',
			filePath: wrapper.dst,
		});
	},
});
