# @myelophone/nuxt

Production-oriented Nuxt 4 + Tailwind CSS 4 application framework and Nuxt layer with SSR/SSG, multilingual routing, consent-aware integrations, Pinia stores, SEO, security headers, performance tooling, and reusable responsive components library.

> [!TIP]
> **Need a ready-to-run frontend instead of assembling a project from scratch?**
> [`@myelophone/nuxt-template`](https://github.com/myelophone/nuxt-template) is the official frontend boilerplate built on `@myelophone/nuxt`. It provides a prepared application structure and starting point for quickly developing a new service or web site.
>
> **[Open template repository](https://github.com/myelophone/nuxt-template)** · **[Create a repository from this template](https://github.com/myelophone/nuxt-template/generate)**
>
> ```bash
> git clone https://github.com/myelophone/nuxt-template.git my-frontend
> cd my-frontend
> ```

## What is this

@myelophone/nuxt is an extendable Nuxt framework layer that supplies application shell behavior, modules, components, composables, stores, styles, middleware, server routes, and build optimizations.

This repository contains the framework source and its `playground/` test application used exclusively while developing the layer, following the Nuxt convention for module/layer development. New applications should start from the separate [@myelophone/nuxt-template](https://github.com/MyelophOne/nuxt-template), which consumes this layer and provides the application-facing project structure.

It is intended for content sites, landing pages, multilingual corporate sites, product interfaces, dashboards, catalogues, and commerce frontends that need a common production baseline instead of assembling the same infrastructure for every project.

The layer includes:

- Nuxt 4 and Vue 3 with TypeScript;
- Tailwind CSS 4 and a light/dark CSS-variable theme;
- SSR builds with Nitro's `node-cluster` preset by default, plus an explicit static generation mode;
- localized routes and lazy namespace-based translations without external dependencies;
- SEO metadata, canonical URLs, alternate-language links, robots, OG images, breadcrumbs JSON-LD, and FAQ JSON-LD;
- cookie consent with necessary, analytics, marketing, and functional categories;
- presets for 30+ analytics, advertising, CRM, chat, and form providers;
- built-in cross-tab synchronization for theme and consent settings, optional user and cart stores, and selected fields from custom Pinia stores;
- currency conversion and an exchange-rate proxy;
- reusable UI, layout, media, navigation, and content components;
- CSP and security headers, request size limits, rate limiting, URL normalization, compression, asset caching, CSS cleanup, and build-time i18n tree shaking;
- reduced-motion, slow-network, low-battery, bot, and legacy-browser fallbacks;
- health endpoints, Playwright smoke testing, Biome, Commitlint, and semantic-release.

## Requirements

- Node.js 24+ for local development. CI currently uses Node.js 26.
- Yarn 4.18.0 through Corepack.
- A modern browser for the complete interactive experience. Static and reduced-motion fallbacks cover constrained clients.

```bash
corepack enable
yarn install
yarn prepare
```

## Quick start

### Start a new application from the template

Use the dedicated template repository for application development:

```bash
git clone https://github.com/MyelophOne/nuxt-template.git my-app
cd my-app
corepack enable
yarn install
yarn dev
```

The template owns project-specific pages, components, assets, locales, and configuration while inheriting the framework from `@myelophone/nuxt`. Follow the template README for its exact file layout and bootstrap process.

Inside this framework repository, maintainers test layer behavior and configuration overrides through `playground/myelophone.ts`:

```ts
export default defineNuxtConfig({
 app: {
  head: {
   title: "Acme",
  },
 },
 multi18n: {
  defaultLocale: "en",
  locales: ["en", "pl", "de"],
 },
 runtimeConfig: {
  apiBaseServer: "https://api.internal.example.com",
  public: {
   apiBase: "https://api.example.com",
   siteUrl: "https://example.com",
   bundleTranslations: false,
   splitCss: true,
   stores: { cart: true, user: true },
   frankfurterBaseCurrency: "EUR",
   frankfurterCurrencies: ["USD", "PLN", "GBP"],
   creativeCursor: false,
  },
 },
});
```

`playground/nuxt.config.ts` deep-merges this file over the base layer. Objects are merged recursively and arrays are appended with duplicate primitive values removed. This playground exists only for framework development and testing; application scaffolding belongs to `nuxt-template`.

### Extend it as a Nuxt layer

The layer can be installed directly from GitHub without registry configuration, access tokens, or GitHub Packages authentication. Add the dependency to the consuming application's `package.json`:

```json
{
 "devDependencies": {
  "@myelophone/nuxt": "git+https://github.com/myelophone/nuxt.git"
 }
}
```

Install dependencies and prepare Nuxt types:

```bash
yarn install
yarn nuxt prepare
```

The dependency name from `package.json` is then used by `extends`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
 extends: ["@myelophone/nuxt"],

 multi18n: {
  defaultLocale: "en",
  locales: ["en", "pl"],
 },
});
```

## Commands

| Command             | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `yarn dev`          | Start the playground in development mode.                      |
| `yarn build`        | Build the playground for SSR using the selected Nitro preset.  |
| `yarn server`       | Run the built Node server.                                     |
| `yarn generate`     | Generate a static site into `playground/.output/public`.       |
| `yarn preview`      | Preview a completed build.                                     |
| `yarn analyze`      | Analyze the Nuxt bundle.                                       |
| `yarn test:types`   | Type-check the layer and playground.                           |
| `yarn playwright`   | Run browser tests; it builds and starts the app automatically. |
| `yarn test`         | Run type checks, then Playwright tests.                        |
| `yarn biome:check`  | Apply Biome lint fixes to `app/` and `playground/`.            |
| `yarn biome:format` | Format `app/` and `playground/`.                               |
| `yarn audit`        | Audit installed packages.                                      |
| `yarn upgrade`      | Upgrade Nuxt and regenerate prepared types.                    |
| `yarn update`       | Interactively update dependencies.                             |
| `yarn lock-update`  | Deduplicate the lockfile using the highest versions.           |

The scripts use POSIX-style environment assignments and are expected to run in Linux, macOS, WSL, Git Bash, or CI. On native PowerShell, set the variables first or use a compatible shell.

## Configuration reference

### Environment variables

| Variable                              | Effect                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NUXT_STATIC=true`                    | Select the `static` Nitro preset, disable IPX, and copy the included `.htaccess` into static output. |
| `NITRO_PRESET=<preset>`               | Override the SSR preset; defaults to `node-cluster`.                                                 |
| `NUXT_PLAYGROUND=true`                | Include playground sources/locales while developing or building this repository.                     |
| `PROD_DIST=true`                      | Exclude playground-only locale globs from `useMultiLang`.                                            |
| `JSON_PLACEHOLDER_API_BASE_URL=<url>` | Replace the default `jsonPlaceholder` endpoint used by `nuxt-api-party`.                             |
| `NODE_ENV=development                 | production                                                                                           | test` | Controls devtools, source maps, OG generation, and production-only processing. |

Nuxt runtime values can also be supplied with standard `NUXT_*` environment-variable mapping, for example `NUXT_API_BASE_SERVER` and `NUXT_PUBLIC_API_BASE`.

### Runtime configuration

| Key                              | Default          | Purpose                                                                            |
| -------------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `apiBaseServer`                  | unset            | Private server-side base URL used by `useApi`.                                     |
| `public.apiBase`                 | unset            | Public API base fallback used by `useApi` on the server.                           |
| `public.siteUrl`                 | unset            | Absolute production origin for hreflang and breadcrumb JSON-LD during SSR.         |
| `public.cookieControl.enabled`   | `true`           | Enables the consent banner and preferences flow.                                   |
| `public.cookieScripts`           | empty categories | Consent-aware integrations and legal notices.                                      |
| `public.bundleTranslations`      | `true`           | Bundle locale data together; `false` enables per-locale chunk grouping.            |
| `public.splitCss`                | `true`           | Controls Vite CSS code splitting.                                                  |
| `public.stores.cart`             | `false`          | Initialize the cart store, exchange rates, persistence, and tab sync.              |
| `public.stores.user`             | `false`          | Initialize the user store, session extension, persistence, and tab sync.           |
| `public.frankfurterCurrencies`   | `[]`             | Default quote currencies for `/api/exchange-rates`. Empty means provider defaults. |
| `public.frankfurterBaseCurrency` | `USD`            | Base currency for the exchange-rate endpoint.                                      |
| `public.creativeCursor`          | `false`          | Enable the custom cursor for fine pointers without reduced motion.                 |
| `public.tally.domain`            | `tally.so`       | Default host used by `ViewTallyForm`.                                              |

## Rendering and deployment

### SSR / Node cluster

```bash
yarn build
yarn server
```

> [!IMPORTANT]
> A regular production build uses Nitro's `node-cluster` preset by default. Running `yarn build` without `NUXT_STATIC` or `NITRO_PRESET` therefore produces a clustered Node.js server build.

The effective preset selection is:

```ts
process.env.NUXT_STATIC === "true"
	? "static"
	: process.env.NITRO_PRESET || "node-cluster";
```

Start the generated cluster build with `yarn server`, which runs `playground/.output/server/index.mjs` in this repository. In an application based on `@myelophone/nuxt-template`, run its corresponding production server command.

The default cluster preset lets Nitro run the application through Node's cluster model. This is the ready-to-use default for a dedicated Node.js host or container where the application owns its process model. HTML responses are compressed with Brotli/Gzip, public assets are precompressed, and hashed `/_nuxt/**` assets receive a one-year immutable cache header.

No configuration is required to keep `node-cluster`. Set `NITRO_PRESET` only when the deployment platform expects another Nitro target. For example, use a single Node server when Kubernetes, Docker orchestration, systemd, PM2, or the hosting platform manages process replication externally:

```bash
NITRO_PRESET=node-server yarn build
```

`NUXT_STATIC=true` takes precedence over `NITRO_PRESET` and selects the static preset instead of a Node server build.

### Static generation

```bash
yarn generate
```

Static mode disables runtime image transformation and payload extraction, crawls links, and includes an Apache `.htaccess` with clean HTML routing, compression, security headers, and cache rules.

### High-load topology

The repository provides an application-level baseline, not a complete distributed architecture. For high traffic, place the app behind a CDN/reverse proxy, terminate TLS there, cache immutable assets and suitable HTML/API responses, run multiple stateless app instances, centralize logs/metrics, and use external durable storage for shared state.

The configured rate limiter uses an in-memory LRU driver. Its quota is local to each process, worker, or replica; use a shared driver or enforce global limits at the gateway before treating it as a distributed abuse-control mechanism.

Health checks are available at:

- `GET /healthz` → `{ "status": "ok" }`;
- `GET /api/healthz` → `ok`.

## Styling and themes

Global styles are loaded by the base `app.vue`. Tailwind scans Vue files across the layer and consumer project. The theme is driven by `data-theme="light|dark"` and these CSS variables:

```css
:root {
 --ui-bg: #f7f7f7;
 --ui-text: #1a1a1b;
 --ui-border: #374151;
 --loader-fill-color: #0082e6;
}
```

Use the settings store to switch or synchronize themes:

```vue
<script setup lang="ts">
const settings = useSettingsStore();
</script>

<template>
 <UiButton label="Toggle theme" @click="settings.toggleTheme()" />
</template>
```

The choice is stored locally, synchronized across tabs, reflected in the browser theme color, and initialized before paint to reduce theme flashing.

### Reveal animations

`v-reveal` uses IntersectionObserver and automatically disables motion for bots, slow connections, low battery, old browsers, and `prefers-reduced-motion` users.

```vue
<section v-reveal>Default slide reveal</section>
<section v-reveal:fade.fast>Fast fade</section>
<section
 v-reveal:zoom.slow.repeat="150"
>Repeated zoom; 150 ms queue step</section>
```

Supported style arguments include `slide`, `fade`, and `zoom`; modifiers are `fast`, `slow`, and `repeat`.

## Internationalization

The built-in `multi18n` module provides localized routes, lazy namespace loading, interpolation, pluralization, compact numbers, locale-aware links and visibility, language switching, fallback translations, SEO integration, and build-time removal of unused keys. No separate i18n module is required.

### Configuration

Configure the supported languages and the unprefixed default language:

```ts
export default defineNuxtConfig({
 multi18n: {
  defaultLocale: "en",
  locales: ["en", "pl", "ru"],
 },
});
```

`defaultLocale` defaults to `en`; `locales` defaults to `['en']`. Duplicate locale values are removed in public runtime configuration. Use lowercase two-letter locale codes such as `en`, `pl`, and `ru` for consistent route and SEO handling.

### Localized routes

Every regular Nuxt page receives a route for each non-default locale:

| Source page | English, the default locale | Polish | Russian |
| ----------- | --------------------------- | ------ | ------- |
| `/` | `/` | `/pl` | `/ru` |
| `/about` | `/about` | `/pl/about` | `/ru/about` |
| `/products/[slug]` | `/products/:slug` | `/pl/products/:slug` | `/ru/products/:slug` |

The default language never needs a URL prefix. A prefixed default-language URL such as `/en/about` is permanently redirected to `/about`.

Exclude a page from route localization when it must have only one URL:

```vue
<script setup lang="ts">
definePageMeta({
	i18n: false,
});
</script>
```

Catch-all pages such as `[...all].vue` are not duplicated. An explicitly defined localized path is also preserved instead of being generated a second time.

The active locale is resolved from the first URL segment during SSR and updated after client navigation. The framework synchronizes `settingsStore.currentLocale` and the document's `<html lang>` attribute with that route.

### Translation files and namespaces

Translation files use namespace paths:

```text
app/locales/en/common.json
app/locales/pl/common.json
app/locales/en/products.json
app/locales/pl/products.json
```

The filename is the namespace: `products.json` is loaded with `useMultiLang('products')`, and its keys are addressed as `products.*`. Namespace paths can also be nested, for example `locales/en/account/profile.json` → `account/profile.*`.

Translation files are discovered in both the framework and application locale directories. Keep application-specific translations in their own namespaces. Inside a loaded JSON file, nested objects and dotted keys are expanded and can be mixed:

```json
{
	"title": "Products",
	"hello": "Hello, {name}!",
	"filters.empty": "No matching products",
	"cart": {
		"title": "Your cart"
	},
	"items_zero": "No items",
	"items_one": "{count} item",
	"items_other": "{count} items"
}
```

### Loading and translating namespaces

```vue
<script setup lang="ts">
const { t, tn, loadPromise, refresh } = useMultiLang(["products"]);

// `loadPromise` is the reactive pending state returned by useAsyncData.
// Call refresh() when translation files must be reloaded explicitly.
</script>

<template>
	<div :aria-busy="loadPromise">
		<h1>{{ t("products.title") }}</h1>
		<p>{{ t("products.hello", { name: "Ada" }) }}</p>
		<p>{{ t("products.items", 0) }}</p>
		<p>{{ t("products.items", 12) }}</p>
		<p>{{ tn("products.items", 12500) }}</p>
	</div>
</template>
```

`useMultiLang` accepts one namespace or an array and returns:

| Member | Purpose |
| ------ | ------- |
| `t(key)` | Translate a string |
| `t(key, params)` | Replace `{placeholder}` values |
| `t(key, count)` | Select a plural form and format `{count}` |
| `t(key, params, count)` | Combine interpolation and pluralization |
| `t(key, params, count, rule)` | Force a plural suffix such as `few` or `many` |
| `tn(key, count, params?)` | Use compact number formatting such as `12K` for large counts |
| `loadPromise` | Reactive namespace-loading state |
| `refresh()` | Reload the selected namespaces through Nuxt async data |

Plural keys use the suffixes returned by `Intl.PluralRules`, such as `_one`, `_few`, `_many`, and `_other`. For zero, `_zero` is checked first. `_other` is the final plural fallback.

```ts
const { t, tn } = useMultiLang('products');

t('products.hello', { name: 'Ada' });
t('products.items', 0); // products.items_zero
t('products.items', { category: 'books' }, 3);
t('products.items', {}, 3, 'few'); // explicitly use products.items_few
tn('products.items', 12_500); // compact, locale-aware {count}
```

Missing active-locale translations fall back to the default locale when that namespace is available, and unresolved values return the full translation key. Interpolated numbers use locale-aware `Intl.NumberFormat` formatting.

Namespaces are loaded lazily with `import.meta.glob`, cached in shared Nuxt state, loaded again when the active locale changes, and SSR-serialized for hydration. Set `public.bundleTranslations: false` to group translation assets into separate per-locale chunks; keep it `true` to use the normal bundle grouping.

### Dynamic keys and tree shaking

Production builds scan `.vue`, `.ts`, `.js`, and `.mjs` sources for literal keys used by `t()`, `tn()`, and `$t()`. Unused JSON entries are removed, while all plural variants belonging to a used base key are retained.

Dynamic translation keys cannot always be found statically. Preserve them with either method:

```ts
// @i18n-keep products.dynamic_title

useSafeList(
	{
		titleKey: 'products.dynamic_title',
		emptyStateKeys: [
			'products.empty.search',
			'products.empty.category',
		],
		sections: [
			{ headingKey: 'products.sections.featured' },
		],
	},
	{ safelistPath: 'i18n-safelist.json' },
);
```

`useSafeList` recursively collects:

- direct translation-key strings;
- object properties whose names end in `Key`, except `loadKey`;
- arrays stored in properties whose names end in `Keys`;
- matching values inside nested arrays and objects.

It is intended for server/build-time code because it uses the Node filesystem. Without options it writes sorted keys to `.nuxt/i18n-safelist.generated.json`. To feed collected keys directly into the configured tree-shaker, set `safelistPath: 'i18n-safelist.json'` as above. The same root file can also be maintained manually:

```json
[
	"products.dynamic_title",
	"products.empty.search",
	"products.empty.category"
]
```

Literal calls, `@i18n-keep` comments, the configured root safelist, and keys registered by built-in framework configuration are combined during the build.

### Locale-aware navigation and content

Language-aware components:

```vue
<UiLanguageSelect show-full />
<UiLangLink to="/pricing">Pricing</UiLangLink>
<UiLangVisible only="pl">Polish-only content</UiLangVisible>
<UiLangVisible :except="['pl', 'ru']">All other languages</UiLangVisible>
```

`UiLanguageSelect` lists configured locales, keeps the current path, query, and hash when switching, removes the prefix for the default locale, and automatically opens upward or right-aligned when viewport space is limited. Use its slots and class props for a custom presentation:

```vue
<UiLanguageSelect
	show-full
	container-class="relative"
	trigger-class="rounded-lg px-4 py-2"
	dropdown-class="rounded-lg"
	option-class="text-sm"
>
	<template #trigger>
		<span class="uppercase">Choose language</span>
	</template>
</UiLanguageSelect>
```

Full language names use keys such as `common.en`, `common.pl`, and `common.ru`. Add them to every configured locale's `common.json` when `show-full` is enabled.

`UiLangLink` accepts `to`, `exact`, and `replace`. It prefixes internal paths only when the active locale is not the default and avoids adding the same prefix twice:

```vue
<UiLangLink to="/products">Products</UiLangLink>
<UiLangLink to="/checkout" replace>Checkout</UiLangLink>
```

`UiLangVisible` accepts a locale string or array through either `only` or `except`. If both are omitted, its slot is always rendered.

The settings store can also drive language changes directly:

```vue
<script setup lang="ts">
const settings = useSettingsStore();

const selectPolish = () => settings.setLocale('pl');
</script>

<template>
	<UiButton @click="selectPolish">Polski</UiButton>
</template>
```

`setLocale()` ignores unsupported locale values and navigates to the equivalent localized route while retaining the current query and hash.

### i18n and SEO

For localized pages, the application shell updates `<html lang>`, creates alternate `hreflang` links and an `x-default` link, and keeps localized breadcrumb paths and labels in sync. Set `runtimeConfig.public.siteUrl` to the canonical production origin so SSR can produce absolute URLs.

## SEO and URL behavior

### Page metadata

```vue
<script setup lang="ts">
const product = await fetchProduct();

useAppSeo({
 title: () => product.name,
 descriptionKey: "products.seo_description",
 params: { name: computed(() => product.name) },
 noIndex: !product.isPublished,
});
</script>
```

`useAppSeo` sets title, Open Graph title, description, Open Graph description, robots, and the current breadcrumb title. A static `titleKey` can be used instead of a value/function.

Other built-in SEO behavior:

- canonical URLs preserve only the `page` query parameter;
- URL paths are normalized to lowercase, duplicate/trailing slashes are removed, and production traffic is redirected away from `www` and HTTP;
- alternate-language and `x-default` links are generated for localized pages;
- breadcrumb JSON-LD is generated from route metadata and translation keys;
- `UiAccordion faq` emits FAQPage JSON-LD;
- `SeoNoIndex` marks 4xx pages as `noindex, nofollow`;
- `SeoContentNoIndex` wraps content in `data-nosnippet` and renders it client-side;
- `nuxt-og-image`, robots, link checking, and SEO utilities are included.

```vue
<ViewBreadcrumbs :max-chars="40" separator="›" />

<SeoContentNoIndex fallback-height="160px">
	Private or volatile text
	<template #placeholder><span aria-hidden="true" /></template>
</SeoContentNoIndex>
```

Set `public.siteUrl` in production. Without it, server-rendered absolute alternate and breadcrumb URLs do not have a reliable origin.

## Cookie consent and third-party scripts

The application shell automatically renders the banner and settings modal. Preferences are stored for one year in `privacy-preferences`; necessary cookies are always enabled. A full decline is remembered for 30 days before the banner is shown again.

### Configure presets

```ts
import {
 cookieScriptPresets,
 mergeCookieScriptConfigs,
} from "#myelophone/app/constants/predefinedCookieScripts";

const cookieScripts = mergeCookieScriptConfigs(
 cookieScriptPresets.googleTagManager({ containerId: "GTM-XXXX" }),
 cookieScriptPresets.googleAnalytics4({ measurementId: "G-XXXX" }),
 cookieScriptPresets.microsoftClarity({ projectId: "xxxx" }),
);

export default defineNuxtConfig({
 runtimeConfig: {
  public: { cookieScripts },
 },
});
```

Available presets and required identifiers:

| Group         | Presets                                                                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google        | `googleTagManager(containerId)`, `googleAnalytics4(measurementId)`, `googleAds(conversionId)`, `recaptcha(siteKey)`                                                                                        |
| Advertising   | `metaPixel(pixelId)`, `vkPixel(pixelId)`, `myTargetTopMailRu(counterId)`, `linkedInInsight(partnerId)`, `tiktokPixel(pixelId)`, `pinterestTag(tagId)`, `xPixel(pixelId)`                                   |
| Analytics     | `yandexMetrica(counterId)`, `baiduTongji(siteId)`, `matomo(trackerUrl, siteId)`, `plausible(domain)`, `umami(websiteId, src)`, `hotjar(siteId)`, `microsoftClarity(projectId)`, `adobeAnalytics(src)`      |
| CRM/marketing | `hubspot(portalId)`, `bitrix24(widgetId)`, `amoCrm(widgetHash)`, `salesforcePardot(src)`, `mailchimp(src)`                                                                                                 |
| Chat          | `intercom(appId)`, `zendeskChat(key)`, `crispChat(websiteId)`, `tawkTo(propertyId, widgetId)`, `jivoSite(widgetId)`, `liveChat(license)`, `tidio(publicKey)`, `chatwoot(websiteToken)`, `chatra(chatraId)` |

Every preset also accepts common overrides such as `id`, localized `name`/`description`, translation keys, `legalBasis`, `loadKey`, and Nuxt Scripts `options`. `mergeCookieScriptConfigs` combines categories and registers translation keys for build-time safelisting.

Umami supports `legalBasis: 'cookieless'`; in that mode it is listed as a legal notice rather than a consent-gated analytics script.

### Define a custom integration

```ts
runtimeConfig: {
	public: {
		cookieScripts: {
			analytics: [{
				id: 'acme-analytics',
				name: { en: 'Acme Analytics', pl: 'Analityka Acme' },
				nameKey: 'cookies.acmeAnalytics.name',
				description: 'Anonymous traffic measurement',
				descriptionKey: 'cookies.acmeAnalytics.description',
				provider: 'Acme',
				legalBasis: 'consent',
				loadKey: 'acme-analytics',
				src: 'https://cdn.example.com/analytics.js',
				beforeLoad: 'window.acmeQueue = window.acmeQueue || [];',
				onConsentChange: 'window.acmeConsent = context.categories;',
				options: { scriptAttributes: { defer: true } },
			}],
		},
	},
}
```

Add the referenced `nameKey` and `descriptionKey` to each locale's `cookies.json`. The loader deduplicates scripts by `loadKey`, runs one-time initializers, applies category-specific hooks, and exposes consent state to hook code as `context.categories` and `context.isAllowed(category)`.

### Gate embedded content

```vue
<CookieConsentWrapper category="functional" service-name="Support chat">
	<SupportChat />
</CookieConsentWrapper>

<ConsentYoutube video-id="dQw4w9WgXcQ" />
<ConsentGoogleMap address="Warsaw, Poland" language="pl" region="pl" />

<CookiePrivacyPolicy title="Cookie policy" />
```

Programmatic controls:

```ts
const {
 cookiePreferences,
 isBannerVisible,
 acceptAll,
 declineAll,
 savePreferences,
 checkConsent,
} = useCookieControl();

savePreferences({ analytics: true, marketing: false, functional: true });
```

This is a technical consent mechanism, not legal advice. Validate categories, wording, retention, transfers, and lawful bases with counsel for each deployment.

## API access

`useApi` returns typed `get`, `post`, `put`, and `delete` helpers. It retries requests three times, forwards `auth_token` as a Bearer token, and converts response failures into Nuxt errors.

```ts
interface Product {
 id: number;
 name: string;
}

const api = useApi();

const products = await api.get<Product[], { category?: string }>("/products", {
 category: "audio",
});

const created = await api.post<Product, { name: string }>("/products", {
 name: "Myelophone",
});
```

Configure both `apiBaseServer` and `public.apiBase` for real deployments. The current client-side fallback is `http://localhost:3000`, so relying on the default outside local development is unsafe.

## User store

Enable it with `public.stores.user: true`. The store provides normalized profiles, roles/permissions, auth status, expiry checks, session extension, consent-aware persistence, and cross-tab synchronization.

```ts
const user = useUserStore();

user.configureUser({
 storageKey: "user",
 cookieMaxAge: 60 * 60 * 24 * 14,
 persistSession: true,
 sessionExtensionSeconds: 3600,
});

user.setAuthenticated({
 profile: {
  id: 42,
  email: "ada@example.com",
  name: "Ada",
  roles: ["admin"],
  permissions: ["orders.read"],
 },
 session: {
  expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  provider: "api",
 },
});

if (user.hasRole("admin") && user.hasPermission("orders.read")) {
 // show authorized UI
}
```

Connect renewal to a backend:

```ts
user.setSessionExtender(async ({ session }) => {
 return await $fetch("/api/session/extend", {
  method: "POST",
  body: { expiresAt: session?.expiresAt },
 });
});
```

Main actions: `initUser`, `configureUser`, `applyState`, `setAuthenticating`, `setRefreshing`, `setAuthenticated`, `setProfile`, `patchProfile`, `setSession`, `setSessionExtender`, `extendSession`, `hasRole`, `hasAnyRole`, `hasPermission`, `hasAnyPermission`, `setError`, `clearError`, `logout`, and `resetStorage`.

The persisted profile/session is client-readable and must never be treated as authorization proof. Keep access/refresh tokens in secure HttpOnly cookies and enforce all authorization on the server.

## Cart, totals, coupons, and currencies

Enable it with `public.stores.cart: true`. The cart supports mixed item currencies, quantity management, coupons, custom metadata, exchange rates, calculation strategies/hooks, consent-aware persistence, and cross-tab synchronization.

```ts
const cart = useCartStore();

cart.configureCart({
 baseCurrency: "EUR",
 autoFetchRates: true,
 rateEndpoint: "/api/exchange-rates",
 taxPercentMetaKey: "vatPercent",
 shippingAmountMetaKey: "shippingAmount",
 shippingCurrencyMetaKey: "shippingCurrency",
});

cart.addItem({ id: "sku-1", name: "Headphones", price: 99, currency: "EUR" });
cart.incrementItem("sku-1");
await cart.patchMeta({
 vatPercent: 23,
 shippingAmount: 8,
 shippingCurrency: "EUR",
});
cart.applyCoupon("WELCOME10", 10);
cart.setCurrency("PLN");

console.log(cart.totalItems, cart.convertedTotals, cart.grandTotal);
```

Add asynchronous business rules without replacing the store:

```ts
const removeFreeShipping = cart.addStrategy("free-shipping", ({ totals }) => {
 if (totals.subtotal - totals.discount >= 100) return { shipping: 0 };
});

const stopAudit = cart.onAfterCalculate(async ({ state, totals }) => {
 console.debug("calculated", state.items.length, totals.total);
});

// later
cart.removeStrategy("free-shipping");
stopAudit();
```

Main actions: `initCart`, `configureCart`, `addItem`, `removeItem`, `updateQuantity`, `incrementItem`, `clearCart`, `applyCoupon`, `removeCoupon`, `setMeta`, `patchMeta`, `getMeta`, `setCurrency`, `convertAmount`, `setExchangeRate(s)`, `fetchExchangeRates`, `addStrategy`, `removeStrategy`, `onBeforeCalculate`, `onAfterCalculate`, `applyState`, and `resetStorage`.

`GET /api/exchange-rates?base=EUR&currencies=USD,PLN` validates three-letter currency codes and proxies Frankfurter with a 10-second timeout. Treat third-party rates as informational unless your business requirements explicitly accept that source and update cadence.

## State, storage, device, and browser composables

### Generic persistence

```ts
const preferences = useStorage(
 "preferences",
 { density: "comfortable", dismissed: [] as string[] },
 {
  storage: "cookie",
  fallbackStorage: "local",
  expires: 90,
  deep: true,
  syncTabs: true,
  canUseCookie: () => useCookieControl().checkConsent("functional"),
  shouldPersist: (value) => value.dismissed.length > 0,
 },
);

preferences.value.value.density = "compact";
preferences.refresh();
preferences.remove();
```

`useStorage` supports `local`, `session`, and `cookie` backends, custom serializers, expiry/path, default writes, fallback storage, persistence predicates, storage events, and BroadcastChannel synchronization.

### Cross-tab synchronization

Open tabs from the same origin stay consistent without polling or a page reload. Synchronization starts on the client after Nuxt is ready and uses `BroadcastChannel`; local-storage-backed values also react to the browser `storage` event.

The application shell synchronizes these fields automatically:

| State | Synchronized fields | Availability |
| ----- | ------------------- | ------------ |
| Theme | `settings.theme` and the applied `data-theme`/theme class | Always enabled |
| Cookie preferences | `settings.cookiePreferences`, `settings.isCookieBannerVisible` | Always enabled |
| Cart | `items`, `coupon`, `meta`, `currency` | When `public.stores.cart` is `true` |
| User | `profile`, `session`, `status`, `error`, `lastAuthenticatedAt` | When `public.stores.user` is `true` |

For example, adding an item or applying a coupon in one tab updates the other open tabs. Changing the theme updates both the Pinia state and the rendered document theme. Logging in, refreshing a session, updating a profile, or logging out is reflected across tabs when the user store is enabled.

Cart exchange rates, calculation strategies, hooks, and store configuration are not broadcast. User-store configuration and the session-extender callback are also local to each tab. Only the fields listed above are synchronized.

#### Synchronize selected fields from another Pinia store

Cross-tab synchronization is built in and can be added to any Pinia store with one `useStoreBroadcast` call. Pass the store and list the state fields that should be shared; no custom `BroadcastChannel`, message protocol, watchers, or loop prevention is required.

`useStoreBroadcast` accepts a store, an explicit key allowlist, and an optional channel name:

```ts
const filters = useCatalogFiltersStore();

const stopSync = useStoreBroadcast(filters, {
	keys: ['query', 'sort', 'selectedCategories'],
	channel: 'catalog-filters',
});

// Synchronization is now active for the component's lifetime.
// Cleanup is automatic; call stopSync() only to stop it earlier.
```

To synchronize another field later, add its state key to the same allowlist:

```ts
useStoreBroadcast(filters, {
	keys: ['query', 'sort', 'selectedCategories', 'viewMode'],
});
```

Without `channel`, the channel name is `pinia:<store-id>`. Nested changes are watched deeply. Incoming values are applied with `$patch`, and source identifiers prevent a received update from being broadcast back in a loop.

Broadcast values must be serializable state composed of strings, numbers, booleans, `null`, arrays, and plain objects. Dates are transmitted as ISO strings. Functions, symbols, unsupported values, and circular references are converted to `null` and should not be included in the key list.

#### Synchronize standalone persisted state

`useStorage` enables tab synchronization by default. Set `syncTabs: false` for state that must remain isolated:

```ts
const sharedFilters = useStorage(
	'catalog-filters',
	{ query: '', categories: [] as string[] },
	{
		storage: 'local',
		syncTabs: true,
		deep: true,
	},
);

sharedFilters.value.value.query = 'headphones';
```

Updates and `remove()` calls are propagated through a key-specific `BroadcastChannel`. For local storage, the native `storage` event provides an additional synchronization path.

#### Theme synchronization

Theme changes can be broadcast directly when a custom theme control does not use the settings store:

```ts
const { applyTheme } = useThemeSync();

applyTheme('dark');
```

`applyTheme()` updates `data-theme`, the `light`/`dark` class, and persistent theme storage, then broadcasts the change through the `nuxt-theme-sync` channel. The settings store's `setTheme()` and `toggleTheme()` actions already use this mechanism.

Cross-tab synchronization is browser-local and same-origin. It does not synchronize different browsers, devices, users, server workers, or replicas; use backend persistence and realtime infrastructure when those scopes are required. Browsers without `BroadcastChannel` retain local state but cannot use `useStoreBroadcast` for live tab updates.

### Other composables

| Composable                                     | Returned capability                                                                     | Example use                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `useDevice()`                                  | `isBot`, `isOutdated`, `isMobile`, `isStaticMode`, low-battery and reduced-motion state | Disable expensive visual effects.                                              |
| `useDeviceStore()`                             | Device type, OS, browser, touch, viewport, DPR, orientation, network, language          | Call `initDeviceDetection()` inside setup.                                     |
| `useNetwork()`                                 | `effectiveType`, `isSlowConnection`, `isOnline`                                         | Serve lightweight media on Save-Data/2G/3G.                                    |
| `useGeoFetch()`                                | Cached country/city lookup and `resolve()`                                              | Drive `UiGeoDependent`; 30-minute session cache and 1-second provider timeout. |
| `useThemeSync()`                               | `applyTheme(theme)`                                                                     | Apply and broadcast a theme manually.                                          |
| `useStoreBroadcast(store, { keys, channel? })` | Selected Pinia state synchronization                                                    | Returns a stop function.                                                       |
| `usePiniaStore(useStore)`                      | Store instance bound to Nuxt's Pinia                                                    | Useful in layer utilities.                                                     |
| `usePopupControl(id, days)`                    | `isOpen`, `open(force?)`, `close(persist?)`, `reset`                                    | Frequency-capped promotions.                                                   |
| `useModalState()`                              | Modal stack and body-scroll lock                                                        | Used by `UiModal`.                                                             |
| `useCookieModal()`                             | Open/close/toggle the global settings modal                                             | Link a footer privacy button.                                                  |
| `useCommand(command)`                          | Register/unregister a command for component lifetime                                    | Add actions to the command palette.                                            |
| `useBreadcrumbs()`                             | Reactive breadcrumb list/home metadata                                                  | Used by `ViewBreadcrumbs`.                                                     |
| `useLoadScript()`                              | Promise-based raw script loader                                                         | Simple client-only scripts; prefer consent loader for tracking.                |
| `useScriptLoader()`                            | Initialize consent-aware runtime scripts                                                | Already initialized by the base app.                                           |
| `useSnapScroll()`                              | Register snap resets and scroll to top                                                  | Integrates snap sections with the global button.                               |
| `useStatic()`                                  | Reactive static-build flag                                                              | Select plain images/static effects.                                            |
| `useNuxtVersion()`                             | Injected Nuxt version string                                                            | Display diagnostics.                                                           |
| `useSafeList(source)`                          | Write dynamically referenced i18n keys                                                  | Server/build-time utility only.                                                |

### Command palette

The global palette opens with `Ctrl+K` or `Cmd+K`. Prefix a query with `/` to search static routes and `#` to search registered commands.

```ts
useCommand({
 id: "refresh-data",
 name: "Refresh data",
 hint: "Reload the dashboard",
 keywords: ["sync", "reload"],
 action: () => refreshNuxtData(),
});
```

## Layout system

The components in `components/grid` form a mobile-first, 12-column layout system. They are auto-imported with the `Grid` prefix, so no local imports are required.

Use them in this order for most pages:

```text
GridStack      optional full-width section or background layer
└─ GridContainer  content width and horizontal page padding
   └─ GridRow     wrapping flex row, alignment, and gaps
      └─ GridCol  responsive 12-column content blocks
```

### Quick start

```vue
<template>
	<GridContainer size="boxed" class="py-12 md:py-20">
		<GridRow class="gap-y-8 md:-mx-4" align="center">
			<GridCol :span="7" class="md:px-4">
				<UiHeading :level="1">Product title</UiHeading>
				<p class="mt-4 text-lg text-gray-600">
					A production-ready page section built with the 12-column grid.
				</p>
				<UiButton to="/contact" class="mt-6">Get started</UiButton>
			</GridCol>

			<GridCol :span="5" sm-order="first" class="md:px-4">
				<SafeNuxtImg
					src="/images/product.webp"
					alt="Product interface"
					class="w-full rounded-2xl"
				/>
			</GridCol>
		</GridRow>
	</GridContainer>
</template>
```

`GridRow` wraps automatically. Columns without `sm-span` occupy the full width below `768px`; `span` controls their width from `768px` upward. In the example, the image appears first on mobile because of `sm-order="first"`, while the source order is restored on desktop.

### Components and props

| Component       | Responsibility | Main props |
| --------------- | -------------- | ---------- |
| `GridContainer` | Centers content, limits its maximum width, and adds default horizontal page padding. | `size`, `py`, `my`, `mdPy`, `mdMy`, visibility and background props |
| `GridRow`       | Creates a wrapping flex row and controls cross-axis and horizontal alignment. | `size`, `align`, `justify`, `equalHeight`, spacing, visibility, and background props |
| `GridCol`       | Places content on the responsive 12-column grid. | `span`, `smSpan`, `mdSpan`, `smOrder`, visibility, and background props |
| `GridStack`     | Creates a full-width vertical wrapper for sections and layered backgrounds. | `as`, visibility and background props |

All components accept `id` and `class`. Use `class` for gaps, horizontal gutters, typography, borders, and any layout detail not represented by a dedicated prop.

#### `GridStack`

`GridStack` is an optional outer wrapper for a full-width page section. It arranges its children vertically and provides the common background image, gradient, local video, and YouTube background API.

The optional `as` prop changes the root HTML tag and defaults to `div`. Use a semantic tag such as `section`, `article`, `header`, `main`, or `footer` when the wrapper represents a meaningful part of the page.

```vue
<GridStack
	as="section"
	id="features"
	class="h-[640px] text-white"
	bg-image="/images/features-desktop.webp"
	bg-image-sm="/images/features-mobile.webp"
	bg-gradient="linear-gradient(90deg, rgba(2,6,23,.9), rgba(2,6,23,.25))"
>
	<GridContainer size="content" class="h-full justify-center">
		<UiHeading :level="2">Everything needed to ship</UiHeading>
		<p class="mt-4 max-w-xl text-white/80">
			The section tag, responsive background, and content width are controlled independently.
		</p>
	</GridContainer>
</GridStack>
```

Main props:

| Prop | Values/default | Purpose |
| ---- | -------------- | ------- |
| `as` | Any HTML tag, default `div` | Root element |
| `hideOnMobile` | `boolean` | Hide below `768px` |
| `hideOnDesktop` | `boolean` | Hide from `768px` upward |
| Background props | See [Backgrounds, gradients, and media](#backgrounds-gradients-and-media) | Full wrapper background |

`GridStack` fills the available parent height by default. Give it an explicit Tailwind `h-*` class when the section needs a fixed, viewport-based, or responsive height.

#### `GridContainer`

`GridContainer` centers page content, applies a maximum width selected with `size`, and adds safe horizontal padding for every size except `fullwidth`. It is a vertical flex container, so utilities such as `justify-center` and `items-center` can position its children.

```vue
<GridContainer
	size="text"
	id="article-introduction"
	class="py-12 md:py-20"
>
	<UiHeading :level="1">Article title</UiHeading>
	<p class="mt-5 text-lg leading-8 text-gray-600">
		A readable text column centered within the page.
	</p>
</GridContainer>
```

Main props:

| Prop | Values/default | Purpose |
| ---- | -------------- | ------- |
| `size` | `fullwidth`, `full`, `boxed`, `laptop`, `content`, `medium`, `text`, `tablet`, `mobile`; default `content` | Maximum content width |
| `py`, `my` | Tailwind spacing suffix | Vertical padding or margin |
| `mdPy`, `mdMy` | Tailwind spacing suffix | Vertical padding or margin from `768px` |
| `hideOnMobile`, `hideOnDesktop` | `boolean` | Responsive visibility |
| Background props | See [Backgrounds, gradients, and media](#backgrounds-gradients-and-media) | Container background |

`GridContainer` always renders a `div`; choose `GridStack as="..."` when a semantic outer element is required.

#### `GridRow`

`GridRow` is a full-width wrapping flex row. It groups `GridCol` components, controls their alignment, and can optionally constrain and center itself with `size`.

```vue
<GridContainer size="content">
	<GridRow
		align="center"
		justify="between"
		class="gap-y-8 md:-mx-4"
	>
		<GridCol :span="8" class="md:px-4">
			<UiHeading :level="2">Primary content</UiHeading>
		</GridCol>

		<GridCol :span="4" class="md:px-4">
			<UiButton to="/details" block>View details</UiButton>
		</GridCol>
	</GridRow>
</GridContainer>
```

Main props:

| Prop | Values/default | Purpose |
| ---- | -------------- | ------- |
| `size` | Any container size | Optional centered maximum width for the row |
| `align` | `start`, `center`, `end`, `stretch`; default `start` | Cross-axis column alignment |
| `justify` | `start`, `center`, `end`, `between`, `around`, `evenly`; default `start` | Horizontal distribution |
| `equalHeight` | `boolean`, default `false` | Stretch sibling columns equally on desktop |
| `py`, `my`, `mdPy`, `mdMy` | Tailwind spacing suffix | Responsive vertical spacing |
| Visibility and background props | Shared grid API | Responsive visibility and row background |

#### `GridCol`

`GridCol` is a vertical flex column placed on the 12-column grid. It is full width on mobile unless `smSpan` is provided, while `span` controls its desktop width.

```vue
<GridRow class="gap-y-6 md:-mx-3">
	<GridCol :span="8" :sm-span="12" class="md:px-3">
		<article>Main content</article>
	</GridCol>

	<GridCol
		:span="4"
		:sm-span="12"
		sm-order="first"
		class="md:px-3"
	>
		<aside>Shown above the article on mobile and on the right on desktop.</aside>
	</GridCol>
</GridRow>
```

Main props:

| Prop | Values/default | Purpose |
| ---- | -------------- | ------- |
| `span` | `1`–`12`, default `12` | Desktop width in twelfths |
| `smSpan` | `1`–`12` | Mobile width in twelfths; defaults to full width |
| `mdSpan` | `1`–`12` | Explicit desktop width override |
| `smOrder` | `1`–`12`, `first`, `last`, `none` | Mobile order, reset on desktop |
| `hideOnMobile`, `hideOnDesktop` | `boolean` | Responsive visibility |
| Background props | See [Backgrounds, gradients, and media](#backgrounds-gradients-and-media) | Column background |

#### Container sizes

`GridContainer` defaults to `content`. `GridRow` can also receive `size` when a row needs its own centered maximum width.

| `size` value | Maximum width | Typical use |
| ------------ | ------------- | ----------- |
| `fullwidth`  | `100%`, without automatic horizontal padding | Edge-to-edge sections |
| `full`       | `100%` | Full-width content with page padding |
| `boxed`      | The smaller of `90%` and `1500px` | Wide landing pages and dashboards |
| `laptop`     | `1367px` | Wide application layouts |
| `content`    | `1080px` | Default pages and marketing sections |
| `medium`     | `920px` | Forms, feature content, and compact pages |
| `text`       | `728px` | Articles and long-form copy |
| `tablet`     | `600px` | Narrow forms and dialogs presented as pages |
| `mobile`     | `480px` | Authentication and single-column flows |

Every size except `fullwidth` includes `px-4 md:px-0`. Use `full` when content must stay full width but still needs safe mobile page padding.

#### Responsive columns

| Prop | Values | Behaviour |
| ---- | ------ | --------- |
| `span` | `1`–`12`, default `12` | Column width from the `md` breakpoint (`768px`) upward |
| `smSpan` | `1`–`12` | Column width below `768px`; without it the column is full width |
| `mdSpan` | `1`–`12` | Explicit desktop width override |
| `smOrder` | `1`–`12`, `first`, `last`, `none` | Mobile order; normal source order is restored from `768px` |

Think in twelfths: `6 + 6` gives two equal columns, `8 + 4` gives content plus a sidebar, and `3 + 3 + 3 + 3` gives four desktop cards. A row wraps when its columns exceed 12.

To add gutters, put a negative horizontal margin on the row and matching padding on each column. Vertical gaps can be applied directly to the wrapping row:

```vue
<GridRow class="gap-y-6 md:-mx-3">
	<GridCol :span="4" :sm-span="6" class="md:px-3">...</GridCol>
	<GridCol :span="4" :sm-span="6" class="md:px-3">...</GridCol>
	<GridCol :span="4" :sm-span="12" class="md:px-3">...</GridCol>
</GridRow>
```

This layout is one column on small phones, two plus one full-width column when `smSpan` is used, and three equal columns on desktop.

#### Row alignment

`align` accepts `start`, `center`, `end`, or `stretch`. `justify` accepts `start`, `center`, `end`, `between`, `around`, or `evenly`.

Set `equal-height` when cards in the same desktop row must stretch to the height of the tallest column:

```vue
<GridContainer size="content" class="py-16">
	<GridRow :equal-height="true" class="gap-y-6 md:-mx-3">
		<GridCol
			v-for="plan in plans"
			:key="plan.name"
			:span="4"
			class="md:px-3"
		>
			<UiCard class="h-full">
				<template #header>
					<UiHeading :level="2">{{ plan.name }}</UiHeading>
				</template>

				<p>{{ plan.description }}</p>

				<template #footer>
					<UiButton :to="plan.to" block>Choose plan</UiButton>
				</template>
			</UiCard>
		</GridCol>
	</GridRow>
</GridContainer>
```

`equalHeight` applies from the desktop breakpoint. Add `h-full` to the card or inner wrapper when that element must fill the stretched column.

#### Spacing and visibility

`GridContainer` and `GridRow` provide these optional spacing shortcuts:

| Prop | Generated utility |
| ---- | ----------------- |
| `py="12"` | `py-12` |
| `my="8"` | `my-8` |
| `md-py="20"` | `md:py-20` |
| `md-my="12"` | `md:my-12` |

The values are Tailwind spacing scale suffixes. Regular Tailwind classes remain available for asymmetric or breakpoint-specific spacing.

All four grid components support `hide-on-mobile` and `hide-on-desktop`:

```vue
<GridRow>
	<GridCol :span="8">
		<!-- Shared main content -->
	</GridCol>

	<GridCol :span="4" hide-on-mobile>
		<!-- Desktop sidebar -->
	</GridCol>

	<GridCol hide-on-desktop>
		<!-- Compact mobile actions -->
	</GridCol>
</GridRow>
```

`hideOnMobile` hides below `768px`; `hideOnDesktop` hides from `768px` upward.

### Ready-to-use layouts

#### Full-width hero with constrained content

Place the background on `GridStack` and the readable content inside `GridContainer`. This keeps the media edge to edge without losing consistent content alignment.

```vue
<GridStack
	class="h-[min(760px,100dvh)] text-white"
	bg-color="#111827"
	bg-image="/images/hero-desktop.webp"
	bg-image-sm="/images/hero-mobile.webp"
	bg-gradient="linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.15))"
	bg-gradient-sm="linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.9))"
>
	<GridContainer size="boxed" class="h-full justify-center">
		<GridRow align="center">
			<GridCol :span="7">
				<p class="mb-3 text-sm font-semibold uppercase tracking-widest">
					New release
				</p>
				<UiHeading :level="1" class="text-4xl md:text-7xl">
					Build the next product faster
				</UiHeading>
				<p class="mt-6 max-w-2xl text-lg text-white/80">
					A concise value proposition that remains readable over the image.
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<UiButton to="/start">Start now</UiButton>
					<UiButton to="/docs" variant="outline">Documentation</UiButton>
				</div>
			</GridCol>
		</GridRow>
	</GridContainer>
</GridStack>
```

#### Content with a sticky sidebar

```vue
<GridContainer size="content" class="py-12 md:py-20">
	<GridRow align="start" class="gap-y-10 md:-mx-5">
		<GridCol :span="8" class="md:px-5">
			<article class="prose max-w-none">
				<h1>Guide title</h1>
				<!-- Article content -->
			</article>
		</GridCol>

		<GridCol :span="4" class="md:px-5">
			<aside class="md:sticky md:top-24">
				<UiCard>
					<strong>On this page</strong>
					<!-- Navigation -->
				</UiCard>
			</aside>
		</GridCol>
	</GridRow>
</GridContainer>
```

#### Alternating feature rows

Keep the semantic source order consistent and change only the mobile presentation with `smOrder`:

```vue
<GridContainer size="content" class="py-16">
	<GridRow align="center" class="gap-y-8 md:-mx-6">
		<GridCol :span="6" class="md:px-6">
			<UiHeading :level="2">Analytics without extra setup</UiHeading>
			<p class="mt-4 text-gray-600">
				Explain the feature, its outcome, and the next action.
			</p>
		</GridCol>

		<GridCol :span="6" sm-order="first" class="md:px-6">
			<SafeNuxtImg
				src="/images/analytics.webp"
				alt="Analytics dashboard"
				class="w-full rounded-2xl"
			/>
		</GridCol>
	</GridRow>
</GridContainer>
```

#### Responsive application shell

```vue
<GridContainer size="boxed" class="py-6">
	<GridRow align="start" class="gap-y-6 md:-mx-3">
		<GridCol :span="3" hide-on-mobile class="md:px-3">
			<nav class="sticky top-6 rounded-xl border p-4">
				<!-- Desktop navigation -->
			</nav>
		</GridCol>

		<GridCol :span="9" class="md:px-3">
			<main class="min-w-0">
				<!-- Dashboard or application page -->
			</main>
		</GridCol>
	</GridRow>
</GridContainer>
```

### Backgrounds, gradients, and media

Background props are available on `GridStack`, `GridContainer`, `GridRow`, and `GridCol`.

| Desktop/default prop | Mobile override | Purpose |
| -------------------- | --------------- | ------- |
| `bgColor` | — | Any CSS background color |
| `bgImage` | `bgImageSm` | Image URL |
| `bgGradient` | `bgGradientSm` | CSS gradient placed over the image or video |
| `bgSize` | `bgSizeSm` | CSS background size; defaults to `cover` |
| `bgVideo` | `bgVideoSm` | Muted, looping local background video |
| `bgVideoPoster` | `bgVideoPosterSm` | Poster shown while a local video loads |
| `bgYoutube` | `bgYoutubeSm` | YouTube video ID or URL used as a background |

Mobile overrides apply below `768px`. If an image, gradient, size, or poster override is omitted, its desktop value is reused. Set `bg-image-sm="none"` to remove a desktop background image on mobile.

When several media props are supplied for the same breakpoint, YouTube is rendered before local video. For the static background/poster layer, `bgImage` takes precedence over the generated YouTube poster, which takes precedence over `bgVideoPoster`.

#### Local background video with responsive sources

Always provide posters so the section has a useful first frame while video loads or when playback is unavailable.

```vue
<GridStack
	class="h-[680px] text-white"
	bg-video="/video/launch-desktop.mp4"
	bg-video-sm="/video/launch-mobile.mp4"
	bg-video-poster="/images/launch-desktop.webp"
	bg-video-poster-sm="/images/launch-mobile.webp"
	bg-gradient="linear-gradient(90deg, rgba(2,6,23,.85), rgba(2,6,23,.2))"
>
	<GridContainer size="content" class="h-full justify-end py-12">
		<GridRow>
			<GridCol :span="7">
				<UiHeading :level="1">Launch campaign</UiHeading>
				<p class="mt-4 max-w-xl text-white/80">
					Foreground content stays above the video and gradient automatically.
				</p>
			</GridCol>
		</GridRow>
	</GridContainer>
</GridStack>
```

#### Background image on a single column

The same API can be used for a card, banner, or one side of a split layout:

```vue
<GridContainer size="content" class="py-16">
	<GridRow :equal-height="true" class="overflow-hidden rounded-2xl bg-gray-50">
		<GridCol
			:span="5"
			class="min-h-80"
			bg-color="#0f172a"
			bg-image="/images/team-desktop.webp"
			bg-image-sm="/images/team-mobile.webp"
			bg-gradient="linear-gradient(180deg, transparent 35%, rgba(2,6,23,.9))"
		>
			<div class="mt-auto p-6 text-white">
				<p class="text-sm uppercase tracking-wider text-white/70">Our team</p>
				<UiHeading :level="2">Built by product engineers</UiHeading>
			</div>
		</GridCol>

		<GridCol :span="7">
			<div class="flex h-full flex-col justify-center p-8 md:p-12">
				<UiHeading :level="2">A complete split section</UiHeading>
				<p class="mt-4 text-gray-600">
					The image column becomes a full-width visual above the copy on mobile.
				</p>
			</div>
		</GridCol>
	</GridRow>
</GridContainer>
```

#### YouTube background

```vue
<GridStack
	class="h-[640px] text-white"
	bg-youtube="https://www.youtube.com/watch?v=VIDEO_ID"
	bg-youtube-sm="MOBILE_VIDEO_ID"
	bg-gradient="linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.72))"
>
	<GridContainer size="text" class="h-full items-center justify-center text-center">
		<UiHeading :level="1">Campaign headline</UiHeading>
		<p class="mt-4 text-lg text-white/80">Supporting campaign message.</p>
	</GridContainer>
</GridStack>
```

Background videos are decorative, muted, looping, non-interactive media. Use a normal video player or `ConsentYoutube` when users need playback controls, captions, or consent-gated YouTube content.

### Practical rules

- Start sections with `GridContainer size="content"`; switch to `boxed` for wide layouts and wrap everything in `GridStack` for edge-to-edge backgrounds.
- Keep each desktop row at 12 columns unless intentional wrapping is part of the design.
- Use `smSpan` only when a multi-column mobile layout is genuinely readable; the full-width mobile default is safer for forms and text.
- Keep meaningful DOM order for accessibility. Use `smOrder` for visual presentation, not to repair an illogical source order.
- Put row gutters in `class` (`md:-mx-*` on the row and `md:px-*` on its columns) so nested content remains aligned.
- Give background sections an explicit height or enough vertical padding, descriptive foreground content, and sufficient gradient contrast.
- Prefer local background video for decorative motion. Use `ConsentYoutube` for user-controlled YouTube embeds.

## Component reference

All components below are auto-imported. Standard `$attrs` and the documented slots can be used to customize them.

### UI primitives

| Component            | Purpose and principal props/events                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `UiAccordion`        | `items[{ label, content, defaultOpen }]`, `multiple`, `faq`, `ui`; item/header/content scoped slots.                |
| `UiAlert`            | Info/success/warning/error alert with title, description, icon/avatar, size, close button, and action slot.         |
| `UiAvatar`           | Image/icon/initials avatar; `size`, optional status `chipColor` and position.                                       |
| `UiBadge`            | Solid/soft/outline badge; colors, sizes, pill/rounded, icons, avatar, slots.                                        |
| `UiBanner`           | Closable full-width banner with color/variant, icon/avatar, title/default/actions slots.                            |
| `UiButton`           | Button, anchor, or NuxtLink; color/variant/size, loading, disabled, block, rounded, square, leading/trailing icons. |
| `UiCard`             | Div/section/article or link card; bordered, rounded, padded, header/default/footer slots.                           |
| `UiCheckbox`         | Checkbox group with `v-model`, options, legend, disabled state, and dividers.                                       |
| `UiChip`             | Positioned or standalone indicator; text, color, size, inset, visibility, and ping animation.                       |
| `UiCommandPalette`   | Global route/command search opened with `Ctrl/Cmd+K`.                                                               |
| `UiCursorCreative`   | Optional animated desktop cursor; disables itself for coarse pointers and reduced motion.                           |
| `UiFeatureAccordion` | Feature list synchronized with an image; side/mobile ordering and optional links.                                   |
| `UiGeoDependent`     | Show slot using country whitelist/blacklist and optional pre-resolved `geoData`.                                    |
| `UiHeading`          | Semantic `h1`–`h6` with default typography and custom class.                                                        |
| `UiIcon`             | Server component fetching Iconify SVG by `prefix:name`; accepts `size` and class.                                   |
| `UiIcon8`            | Server component fetching Icons8 PNG by icon, type, size, and color.                                                |
| `UiInput`            | Floating-label `v-model` input with type, icon position, placeholder, and disabled state.                           |
| `UiLangLink`         | NuxtLink that adds/removes the current locale prefix.                                                               |
| `UiLanguageSelect`   | Responsive locale dropdown with full/short labels and class overrides.                                              |
| `UiLangVisible`      | Render by `only` or `except` locale lists.                                                                          |
| `UiLightBox`         | Async image gallery/lightbox; string/object images, item/image style/class, pass-through lightbox props.            |
| `UiLocalTime`        | Live time for an IANA timezone; optional label/date/seconds and 12/24-hour mode.                                    |
| `UiModal`            | Teleported stacked modal with `v-model`, title, width, close prevention, body class; emits `close`.                 |
| `UiPopup`            | Frequency-capped popup with id, copy/image, five visual variants, delay, and action slot.                           |
| `UiProtectedEmail`   | Builds an email address only after mount; split user/domain/TLD, subject, placeholder.                              |
| `UiRelativeTime`     | Accessible live relative date with locale override, short/long style, and dynamic tag.                              |
| `UiScheduledContent` | Date-window content with timezone, preview, interval, and daily/yearly repeat; active/upcoming slots.               |
| `UiScrollToTop`      | Global button shown after 600 px; also resets registered snap containers.                                           |
| `UiSegmentedControl` | Single/multiple `v-model`, horizontal/vertical/full layout, icons, sizes, colors, outline/soft style.               |
| `UiSmartContrast`    | Full background image/gradient wrapper with fixed/auto contrast modes and configurable height.                      |
| `UiSnapContainer`    | Vertical/horizontal controlled full-page snapping for `UiSnapSection` children.                                     |
| `UiSnapSection`      | Snap panel with image/video/YouTube mobile variants, poster, overlay, lazy loading, and content class.              |
| `UiSplitSection`     | Image/text split with side, container width, edge image, mobile reversal, and named text slot.                      |
| `UiStickyWrapper`    | Sticky slot with pixel offset; prepares its parent positioning.                                                     |
| `UiTable`            | Sortable table with nested keys and automatic virtualization above 100 rows; emits `sort`.                          |
| `UiTextarea`         | `v-model` textarea with floating label, error state, clear/save controls and `save`/`clear` events.                 |
| `UiTextColumn`       | Typography/spacing wrapper for prose slots.                                                                         |
| `UiToggler`          | Accessible boolean `v-model` switch with label and disabled state.                                                  |
| `UiTruncateText`     | Responsive character limits with localized expand/collapse controls. Text-only slot.                                |
| `UiViewportSpacer`   | Responsive `vh/dvh` or `vw/dvw` spacer.                                                                             |

Example form and virtual table:

```vue
<script setup lang="ts">
const name = ref("");
const filters = ref<string[]>([]);
const rows = ref([{ id: 1, profile: { name: "Ada" } }]);
</script>

<template>
 <UiInput v-model="name" label="Name" icon="heroicons:user" />
 <UiCheckbox
  v-model="filters"
  legend="Features"
  :options="[
   { label: 'SSR', value: 'ssr' },
   { label: 'i18n', value: 'i18n' },
  ]"
 />
 <UiTable
  height="480px"
  :items="rows"
  :columns="[
   { key: 'id', label: 'ID', sortable: true },
   { key: 'profile.name', label: 'Name', sortable: true },
  ]"
 />
</template>
```

Additional component examples:

```vue
<UiAlert variant="success" title="Saved" description="Your changes are live." closable />
<UiBadge label="New" color="blue" variant="soft" />
<UiBanner title="Scheduled maintenance" description="Sunday at 02:00 UTC" closable />
<UiChip text="3" color="red"><UiAvatar name="Ada Lovelace" /></UiChip>
<UiCommandPalette />
<UiCursorCreative />
<UiFeatureAccordion :items="features" default-image="/images/feature.webp" />
<UiIcon8 icon="github" type="color" :size="48" />
<UiLightBox :images="['/gallery/one.webp', '/gallery/two.webp']" />
<UiLocalTime timezone="Europe/Warsaw" label="Warsaw" show-date />
<UiPopup id="welcome-offer" title="Welcome" trigger-delay="1500" />
<UiRelativeTime :date="publishedAt" />
<UiScheduledContent from="2026-12-01T00:00:00Z" to="2026-12-31T23:59:59Z">Holiday offer</UiScheduledContent>
<UiScrollToTop />
<UiSegmentedControl v-model="period" :options="periodOptions" />
<UiSmartContrast src="/images/cover.webp" height="70vh"><UiHeading :level="1">Readable cover</UiHeading></UiSmartContrast>
<UiSnapContainer direction="vertical"><UiSnapSection id="intro" bg-image="/images/intro.webp">Intro</UiSnapSection></UiSnapContainer>
<UiSplitSection image-src="/images/team.webp" image-alt="Our team"><template #text>Team story</template></UiSplitSection>
<UiStickyWrapper :offset="96">Sticky navigation</UiStickyWrapper>
<UiTextarea v-model="message" id="message" label="Message" buttons-position="outside" @save="submit" />
<UiTextColumn text-size-class="text-lg">Long-form readable content</UiTextColumn>
<UiToggler v-model="enabled" label="Enable notifications" />
<UiTruncateText :mobile-limit="120" :desktop-limit="300">Long text to truncate…</UiTruncateText>
<UiViewportSpacer size="20" mobile-size="12" />
```

### Content and view components

| Component             | Purpose and principal props/events                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `ViewAnimatedCounter` | Intersection-driven counter: from/to, duration, decimals, prefix/suffix, separator, once.               |
| `ViewAnnouncementBar` | Sticky/closable colored announcement with title/default/actions slots.                                  |
| `ViewAvatarGroup`     | Overlapping `UiAvatar` children with size, max count, and remainder badge.                              |
| `ViewBreadcrumbs`     | Localized generated breadcrumbs with truncation and separator.                                          |
| `ViewContentWithToc`  | Builds an anchor navigation from slotted h2/h3/h4/heading components.                                   |
| `ViewCopyright`       | Owner, optional start year, and localized “all rights reserved”.                                        |
| `ViewCountdownTimer`  | Timezone-aware target countdown; exposes values to a slot and emits `finish`.                           |
| `ViewCreativeCTA`     | Image/gradient CTA with alignment, two links, and title/description/actions slots.                      |
| `ViewCurrencySelect`  | Cart-backed currency picker with class overrides and trigger slot.                                      |
| `ViewFeatureBoxGrid`  | Linked feature cards with icons, 2–4 columns, layout direction, and description alignment.              |
| `ViewHorizontalMenu`  | Horizontally scrollable route menu with edge fade masks.                                                |
| `ViewImageCompare`    | Mouse/touch before-after image slider with optional labels.                                             |
| `ViewImgSlider`       | Image/video carousel with autoplay interval, manual controls, and vertical mode.                        |
| `ViewInfiniteMarquee` | Seamless repeated string items with duration, delay, and container class.                               |
| `ViewInfoBar`         | Compact information items and actions with icons/callbacks.                                             |
| `ViewLogoGrid`        | Linked logos with color/grayscale variants and mobile item limit.                                       |
| `ViewLogoSlider`      | Infinite logo strip with speed, grayscale, and container class.                                         |
| `ViewQuoteBig`        | Large quotation with author/avatar, alignment, and typography controls.                                 |
| `ViewResponsiveMenu`  | Measures available width and moves overflowed route items into a dropdown.                              |
| `ViewReviewsSlider`   | Responsive draggable review carousel with autoplay and links.                                           |
| `ViewSocialBar`       | Iconify social links with five variants, size, gap, target, and per-item color.                         |
| `ViewTallyForm`       | Tally standard embed, popup, or fullscreen mode; hidden fields, theme colors/options; exposed `open()`. |
| `ViewWarningOutdated` | Full-screen unsupported-browser warning; mounted globally when core APIs are missing.                   |

```vue
<script setup lang="ts">
const tally = ref<{ open: () => void }>();
</script>

<template>
 <ViewAnimatedCounter :to="250000" suffix="+" :duration="1800" />

 <ViewTallyForm
  ref="tally"
  form-id="abc123"
  mode="popup"
  :hidden-fields="{ plan: 'pro' }"
  :options="{ hideTitle: true }"
 >
  <UiButton label="Contact us" @click="tally?.open()" />
 </ViewTallyForm>
</template>
```

Additional view examples:

```vue
<ViewAnnouncementBar title="Version 2 is available" sticky closable />
<ViewAvatarGroup :max="4"><UiAvatar v-for="person in team" :key="person.id" :src="person.avatar" /></ViewAvatarGroup>
<ViewContentWithToc><article><h2>Installation</h2><p>...</p></article></ViewContentWithToc>
<ViewCopyright owner="MyelophOne" :start-year="2024" />
<ViewCountdownTimer target-date="2027-01-01T00:00:00Z" timezone="UTC" />
<ViewCreativeCTA title="Start building" primary-text="Get started" primary-link="/start" />
<ViewCurrencySelect />
<ViewFeatureBoxGrid :items="features" :columns="3" />
<ViewHorizontalMenu :items="[{ label: 'Overview', path: '/' }, { label: 'Docs', path: '/docs' }]" />
<ViewImageCompare before-image="/before.webp" after-image="/after.webp" before-label="Before" after-label="After" />
<ViewImgSlider :media="slides" :auto-scroll="true" :auto-scroll-interval="5000" />
<ViewInfiniteMarquee :items="['Nuxt', 'Vue', 'Tailwind']" :duration="24" />
<ViewInfoBar :items="contactItems" :actions="contactActions" />
<ViewLogoGrid title="Trusted by teams" :items="logos" />
<ViewLogoSlider :logos="logos" :speed="30" grayscale />
<ViewQuoteBig text="A product-defining result." author-name="Ada Lovelace" />
<ViewResponsiveMenu :items="navigation" />
<ViewReviewsSlider :items="reviews" />
<ViewSocialBar :items="socialLinks" variant="rounded" size="lg" />
<ViewWarningOutdated />
```

### Safe media, consent, SEO, and shell components

| Component                              | Purpose                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `SafeNuxtImg`                          | Uses a plain `<img>` in static mode and `NuxtImg` otherwise.                                   |
| `SafeNuxtPicture`                      | NuxtPicture wrapper that avoids adding an error handler unless provided.                       |
| `SafeImgWithLoader`                    | Intersection-lazy image with AVIF/WebP optimization, loader, and `/img/image404.png` fallback. |
| `SafeEmail` / `UiProtectedEmail`       | Client-assembled email address to reduce simple scraping.                                      |
| `ConsentYoutube`                       | Marketing-consent-gated YouTube embed.                                                         |
| `ConsentGoogleMap`                     | Functional-consent-gated address/place-id Google Map.                                          |
| `CookieConsentWrapper`                 | Generic category-gated slot and preference prompt.                                             |
| `CookiePrivacyPolicy`                  | Generated provider/category/legal-source disclosure.                                           |
| `CookieBanner` / `CookieSettingsModal` | Global consent UI; already mounted by the base app.                                            |
| `SeoNoIndex` / `SeoContentNoIndex`     | Page and content indexing controls.                                                            |
| `PagePreloader`                        | Route-loading overlay driven by the settings store.                                            |
| `MyelophoneWelcome`                    | Default framework playground landing page.                                                     |
| `MyelophoneCopyright`                  | Server-rendered copyright island used by the framework welcome screen.                          |

```vue
<SafeEmail user="hello" domain="example" tld="com" subject="Website enquiry" />
<SafeImgWithLoader src="/images/product.webp" alt="Product" width="1200" height="800" />
<SafeNuxtPicture src="/images/hero.webp" alt="Hero" sizes="100vw md:1080px" />
<CookieBanner />
<CookieSettingsModal />
<PagePreloader />
<MyelophoneWelcome />
<NuxtIsland name="MyelophoneCopyright" />
```

## Utility functions

```ts
sortBy(items, "price", "asc");
transliterate("Пример заголовка"); // suitable for generated anchor IDs
getYoutubeEmbed("https://youtu.be/dQw4w9WgXcQ");
getYoutubePoster("dQw4w9WgXcQ");

const refreshing = useAsyncRefresh(refresh);
await refreshing();
```

`sortBy` supports comparable nested item keys at the type level; YouTube helpers accept IDs and common watch/embed/short URLs.

## Built-in production behavior

- Nitro Node cluster by default, with an explicit static mode.
- Brotli/Gzip compression for production HTML and precompressed public assets.
- Immutable caching for hashed Nuxt assets.
- CSS code splitting control, minification, empty/unresolved CSS cleanup, `!important` removal, and modern viewport-unit fallbacks.
- Build banner and third-party license file at `/_nuxt/licenses.md`.
- Lazy route/component/media behavior and selective route preloading.
- Per-locale translation chunks and build-time unused-key removal.
- Strict CSP with nonces, HSTS, content-type/frame/referrer/download/DNS/cross-origin/permissions headers.
- 2 MB general request and 10 MB upload limits.
- In-process rate limit of 150 tokens per five minutes.
- Console log/error/debug/trace removal from production bundles.
- Source maps on the server and development-only client source maps.
- Restore-state, view transitions, component islands, typed pages, early hints, and payload extraction for SSR.
- Accessibility shell: skip link, route announcer, reduced-motion handling, modal keyboard behavior, and semantic time output.

Review the security and performance defaults against each application's threat model. In particular, CORS currently permits all origins, CSRF and SRI are disabled, inline styles are allowed by CSP, and the rate-limit store is process-local.

## Project structure

```text
app/
├── assets/css/        Global Tailwind, theme, animation, media and print CSS
├── components/        UI, grid, view, consent, cookie, safe and SEO components
├── composables/       API, i18n, storage, device, consent and UI state helpers
├── constants/         Layout maps and third-party cookie-script presets
├── locales/           Built-in en/pl/ru namespaces
├── middleware/        Localized and canonical URL behavior
├── modules/           multi18n, i18n tree shaking and static .htaccess
├── plugins/           Theme/locale/URL/reveal/version/restore integrations
├── server/            Nitro routes, middleware and render plugins
├── stores/            Settings, commands, device, optional user and cart stores
├── types/             Runtime config and cookie contracts
└── utils/             Sorting, transliteration, async refresh and YouTube helpers
playground/            Nuxt-recommended test app for framework development
public/                Logos, favicon and browser assets
tests/                 Playwright smoke tests
vite/plugins/          CSS cleanup and viewport compatibility transforms
```

## Maintainers

### Development workflow

1. Use the pinned Yarn release and run `yarn install --immutable`.
2. Make layer changes in `app/`, build plugins in `vite/plugins/`, and development test cases in `playground/`.
3. When a public API changes, update this README, the playground test application, runtime config types, and tests in the same change.
4. Run `yarn test:types`, `yarn biome:check`, `yarn build`, and `yarn playwright` before merging.
5. Run `yarn audit` and assess direct and transitive advisories in both runtime and release tooling.
6. Test both `yarn build` and `yarn generate` when changing rendering, images, payloads, routes, CSS, or server hooks.

### Commit and release policy

Commits follow Conventional Commits and are checked with Commitlint. The `main` branch is released automatically through semantic-release and GitHub Actions:

- `feat:` → minor release;
- `fix:` and `perf:` → patch release;
- `BREAKING CHANGE:` → major release;
- documentation, tests, refactors, build, CI, style, and chores do not release by default.

The release workflow updates `CHANGELOG.md` and `package.json`, publishes to GitHub Packages, creates a GitHub release, and commits release metadata back to the repository.

### Compatibility checklist

- Keep `multi18n` route generation compatible with the unprefixed default locale.
- Add static translation keys directly in `t()`/`tn()` calls; safelist config-driven keys.
- Do not load analytics/marketing/functional scripts outside consent-aware APIs.
- Treat user/cart browser persistence as convenience state, never trusted server state.
- Keep server-only utilities (`node:fs`, build safelists, modules) out of client imports.
- Verify CSP domains whenever adding external APIs, media, frames, fonts, or scripts.
- Confirm proxy-aware origin/HTTPS behavior in the target hosting platform.
- For multiple workers or replicas, move rate limits and any new shared mutable state to distributed infrastructure.
- Preserve the public component/composable names or document breaking changes.
- Check the latest Nuxt compatibility date before updating it.

### Ownership

Maintained by [MyelophOne](https://github.com/MyelophOne).<br>
Author: [Aliaksandr Ivanou](https://github.com/aleksivanou).

## License

Copyright © 2026 Aliaksandr Ivanou. All rights reserved.

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. Commercial use is not granted by that license. Read [LICENSE](LICENSE) before using, redistributing, or building on the project.
