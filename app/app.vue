<script setup>
import "./assets/css/index.css";

const nuxtApp = useNuxtApp();

nuxtApp.hook("app:mounted", () => {
	console.info(
		"%cBuilt on top of @myelophone/nuxt, licensed under the PolyForm Noncommercial License 1.0.0. Copyright © 2026 Aliaksandr Ivanou.\nExperiment, customize and enjoy the speed and the performance! With ❤️ from @myeloph.one. Necessariam et Sufficientem.",
		"font-size:14px",
	);
});

const {
	public: {
		multi18n,
		siteUrl,
		stores,
		creativeCursor,
		pageFullscreenPreloader,
	},
} = useRuntimeConfig();

const globalFullscreenPreloaderOptions =
	pageFullscreenPreloader &&
	typeof pageFullscreenPreloader.component === "string" &&
	pageFullscreenPreloader.component
		? pageFullscreenPreloader
		: null;

const pinia = nuxtApp.$pinia;

const settingsStore = useSettingsStore(pinia);
settingsStore.init();

const userStore = stores.user ? useUserStore(pinia) : null;

const sessionErrorMessage = (error) =>
	error instanceof Error ? error.message : String(error || "Unknown error");

async function extendUserSession() {
	if (!userStore?.user) return;

	try {
		await userStore.extendSession();
	} catch (error) {
		console.warn("[extendUserSession] failed:", sessionErrorMessage);
	}
}

const cartStore = stores.cart ? useCartStore(pinia) : null;

if (cartStore) {
	await callOnce("cart:exchange-rates", async () => {
		if (!cartStore.config.autoFetchRates || cartStore.ratesLoaded) return;

		try {
			await cartStore.fetchExchangeRates();
		} catch {}
	});
}

const router = useRouter();
const route = useRoute();

const htmlLang = computed(
	() => settingsStore.currentLocale || settingsStore.defaultLocale || "en",
);

const supportedLocales = (multi18n?.locales ?? []).map((l) => l.toLowerCase());

watchEffect(() => {
	const m = route.path.match(/^\/([a-z]{2})(?=\/|$)/i);
	const candidate = m?.[1]?.toLowerCase();

	const locale =
		candidate && supportedLocales.includes(candidate)
			? candidate
			: (multi18n?.defaultLocale ?? settingsStore.defaultLocale);

	if (settingsStore.currentLocale !== locale) {
		settingsStore.setLocale(locale);
	}
});

onMounted(() => {
	extendUserSession();
});

router.afterEach(() => {
	extendUserSession();
});

const { t } = useMultiLang(["error", "commands"]);

const { isStaticMode } = useDevice();

const currentTheme = computed(() => settingsStore.theme);

const themeColor = ref(null);

onMounted(async () => {
	await nextTick();

	const getActualBg = () => {
		return getComputedStyle(document.documentElement)
			.getPropertyValue("--ui-bg")
			.trim();
	};

	const updateColor = () => {
		const color = getActualBg();
		if (color) {
			themeColor.value = color;
		} else {
			themeColor.value =
				document.documentElement.getAttribute("data-theme") === "dark"
					? "#121212"
					: "#f7f7f7";
		}
	};

	updateColor();

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.attributeName === "data-theme") {
				updateColor();
			}
		}
	});

	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
});

const toasterPosition = ref("bottom-center");
let mq;
const update = () => {
	toasterPosition.value = mq.matches ? "bottom-center" : "bottom-right";
};
onMounted(() => {
	mq = window.matchMedia("(max-width: 640px)");
	update();
	mq.addEventListener("change", update);
});
onBeforeUnmount(() => {
	mq && mq.removeEventListener("change", update);
});

onNuxtReady(() => {
	useStoreBroadcast(settingsStore, {
		keys: ["theme", "cookiePreferences", "isCookieBannerVisible"],
	});

	if (userStore) {
		userStore.initUser();
		extendUserSession();
	}

	if (cartStore) {
		cartStore.initCart();

		useStoreBroadcast(cartStore, {
			keys: ["items", "coupon", "meta", "currency"],
		});
	}
});

useHead({
	htmlAttrs: {
		lang: computed(() => htmlLang.value),
		class: () =>
			[
				import.meta.client ? "js" : "nojs",
				isStaticMode.value ? "is-static" : "",
			]
				.filter(Boolean)
				.join(" "),
	},
	meta: [
		{ name: "color-scheme", content: "dark light" },
		{
			key: "theme-color",
			name: "theme-color",
			content: () => themeColor.value,
		},
	],
});

const breadcrumbsStore = useBreadcrumbs();
const error = useError();

const isNotFound = useState("is_404");

useHead(
	computed(() => {
		const fullPath = route.path;

		const match = fullPath.match(/^\/([a-z]{2})(?=\/|$)/i);
		const urlLang = match?.[1]?.toLowerCase();
		const currentLang =
			urlLang && supportedLocales.includes(urlLang) ? urlLang : "en";

		// TODO: if 404 - maybe should show error on the selected lang?

		if (error.value?.status === 404 || isNotFound.value)
			return { link: [], script: [] };

		const baseOrigin = (siteUrl || "").replace(/\/+$/, "");
		const origin = import.meta.client ? window.location.origin : baseOrigin;

		const pathSegments = fullPath.split("/").filter(Boolean);
		const cleanPath =
			urlLang && supportedLocales.includes(urlLang)
				? "/" + pathSegments.slice(1).join("/")
				: fullPath;

		const finalPath = cleanPath.replace(/\/+$/, "") || "/";
		const absoluteDefaultHref =
			`${origin}${finalPath}`.replace(/\/+$/, "") || "/";

		const links = [];

		links.push({
			key: "hr-x-default",
			rel: "alternate",
			hreflang: "x-default",
			href: absoluteDefaultHref,
		});

		supportedLocales.forEach((l) => {
			if (l === currentLang) return;

			const langPrefix = l === "en" ? "" : `/${l}`;
			const fullHref =
				`${origin}${langPrefix}${finalPath}`.replace(/\/+$/, "") || "/";

			links.push({
				key: `hr-${l}`,
				rel: "alternate",
				hreflang: l,
				href: fullHref,
			});
		});

		const bList = unref(breadcrumbsStore.breadcrumbs) || [];
		const schema = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: unref(breadcrumbsStore.homeLabel) || "Home",
					item: `${origin}${unref(breadcrumbsStore.homePath) || "/"}`,
				},
				...bList.map((crumb, index) => ({
					"@type": "ListItem",
					position: index + 2,
					name: crumb.title,
					item: `${origin}${crumb.path}`,
				})),
			],
		};

		return {
			link: links,
			script: [
				{
					key: "ld-json-bread",
					type: "application/ld+json",
					innerHTML: JSON.stringify(schema),
				},
			],
		};
	}),
);

const CookieBanner = defineAsyncComponent(
	() => import("~/components/cookie/Banner.vue"),
);

const CookieSettingsModal = defineAsyncComponent(
	() => import("~/components/cookie/SettingsModal.vue"),
);

const BrowserWarning = defineAsyncComponent(
	() => import("~/components/view/WarningOutdated.vue"),
);
const isLegacy = ref(false);
onMounted(() => {
	isLegacy.value = !(
		"fetch" in window &&
		"Promise" in window &&
		"IntersectionObserver" in window
	);
});

const { initCookieConsent } = useCookieControl();
const { initScripts } = useScriptLoader();

initCookieConsent();
onMounted(() => {
	initScripts();
});

const { open: openCookieSettings } = useCookieModal();

useCommand({
	name: t("commands.setDarkTheme"),
	hint: "Dark Mode",
	keywords: ["dark", "ночь", "theme", "skin", "тема"],
	action: () => settingsStore.setTheme("dark"),
});

useCommand({
	name: t("commands.setLightTheme"),
	hint: "Light Mode",
	keywords: ["light", "день", "theme", "skin", "тема"],
	action: () => settingsStore.setTheme("light"),
});
</script>

<template>
	<a href="#main" class="skip-link">Go to main content</a>
	<NuxtRouteAnnouncer />
	<NuxtLayout>
		<NuxtErrorBoundary>
			<main id="main" tabindex="-1">
				<NuxtPage />
			</main>
			<template #error="{ error, clearError }">
				<SeoNoIndex :status-code="error?.statusCode" />
				<div class="error-container" role="alert">
					<h1>{{ t("error.title") }}</h1>
					<p v-if="error">{{ error.message }}</p>
					<button @click="clearError({ redirect: '/' })">
						{{ t("error.tryAgain") }}
					</button>
				</div>
			</template>
		</NuxtErrorBoundary>
	</NuxtLayout>
	<PageFullscreenPreloader
		v-if="globalFullscreenPreloaderOptions"
		:transparent="globalFullscreenPreloaderOptions.transparent"
		:background="globalFullscreenPreloaderOptions.background"
		:background-dark="globalFullscreenPreloaderOptions.backgroundDark"
		:z-index="globalFullscreenPreloaderOptions.zIndex"
		:aria-label="globalFullscreenPreloaderOptions.ariaLabel"
		:class="globalFullscreenPreloaderOptions.class"
		:content-class="globalFullscreenPreloaderOptions.contentClass"
		:minimum-duration="globalFullscreenPreloaderOptions.minimumDuration"
	>
		<PageFullscreenPreloaderConfiguredContent
			v-bind="globalFullscreenPreloaderOptions.props"
		/>
	</PageFullscreenPreloader>
	<Teleport to="#teleports">
		<ClientOnly>
			<PagePreloader />
			<NuxtLoadingIndicator :height="1" color="#0078e7" :throttle="0" />
			<Toaster
				:position="toasterPosition"
				:theme="currentTheme"
				:key="`${currentTheme}-${toasterPosition}`"
				richColors
				:toastOptions="{
					style: {
						paddingTop: '12px',
						paddingBottom: '15px',
						fontSize: '0.9rem',
					},
				}"
			/>
			<CookieBanner @settings="openCookieSettings" />
			<CookieSettingsModal />
			<UiCursorCreative v-if="creativeCursor" />
			<BrowserWarning v-if="isLegacy" />
			<UiCommandPalette />
			<UiScrollToTop />
		</ClientOnly>
	</Teleport>
</template>

<style scoped>
.error-container {
	padding: 2rem;
	text-align: center;
	border-radius: 8px;
	margin: 2rem auto;
	max-width: 600px;
}

button {
	margin-top: 1rem;
	padding: 0.5rem 1rem;
	cursor: pointer;
}

.skip-link {
	position: absolute;
	left: -9999px;
}

.skip-link:focus {
	left: 1rem;
	top: 1rem;
	background: #000;
	color: #fff;
	padding: 0.5rem 1rem;
	z-index: 1000;
}
</style>
