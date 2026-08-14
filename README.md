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
- SSR and static generation modes;
- localized routes and lazy namespace-based translations without external dependencies;
- SEO metadata, canonical URLs, alternate-language links, robots, OG images, breadcrumbs JSON-LD, and FAQ JSON-LD;
- cookie consent with necessary, analytics, marketing, and functional categories;
- presets for 30+ analytics, advertising, CRM, chat, and form providers;
- optional user and cart stores with persistence and cross-tab synchronization;
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

The default production preset is `node-cluster`. HTML responses are compressed with Brotli/Gzip, public assets are precompressed, and hashed `/_nuxt/**` assets receive a one-year immutable cache header.

For containers or platforms that manage their own process model, select their Nitro preset:

```bash
NITRO_PRESET=node-server yarn build
```

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

Configure supported languages and the unprefixed default language:

```ts
export default defineNuxtConfig({
 multi18n: {
  defaultLocale: "en",
  locales: ["en", "pl", "ru"],
 },
});
```

For a page such as `/about`, the module creates `/pl/about` and `/ru/about`. `/en/about` is redirected permanently to `/about`. Set `definePageMeta({ i18n: false })` to prevent localized copies of an individual page.

Translation files use namespace paths:

```text
app/locales/en/common.json
app/locales/pl/common.json
app/locales/en/products.json
app/locales/pl/products.json
```

Consumer locale files override layer values when the same namespace/key is loaded. Nested JSON and dotted keys are both supported.

```json
{
 "title": "Products",
 "hello": "Hello, {name}!",
 "items_one": "{count} item",
 "items_other": "{count} items"
}
```

```vue
<script setup lang="ts">
const { t, tn, loadPromise, refresh } = useMultiLang(["products"]);
</script>

<template>
 <h1>{{ t("products.title") }}</h1>
 <p>{{ t("products.hello", { name: "Ada" }) }}</p>
 <p>{{ t("products.items", 12) }}</p>
 <p>{{ tn("products.items", 12500) }}</p>
</template>
```

`t` supports interpolation and `Intl.PluralRules`; `tn` uses compact number formatting for large counts. Missing active-language keys fall back to the default locale, then to the key itself.

Dynamic translation keys cannot always be found statically. Preserve them with either method:

```ts
// @i18n-keep products.dynamic_title
useSafeList(configDrivenContent);
```

Builds write discovered dynamic keys to `.nuxt/i18n-safelist.generated.json`; an optional root `i18n-safelist.json` can hold manually maintained keys.

Language-aware components:

```vue
<UiLanguageSelect show-full />
<UiLangLink to="/pricing">Pricing</UiLangLink>
<UiLangVisible only="pl">Polish-only content</UiLangVisible>
<UiLangVisible :except="['pl', 'ru']">All other languages</UiLangVisible>
```

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

Components are auto-imported with their directory prefixes.

```vue
<GridContainer size="boxed" py="12">
	<GridRow align="center" justify="between" :equal-height="true">
		<GridCol :span="7" :sm-span="12">
			<UiHeading :level="1">Product title</UiHeading>
		</GridCol>
		<GridCol :span="5" :sm-span="12" sm-order="first">
			<SafeNuxtImg src="/hero.webp" alt="Product" />
		</GridCol>
	</GridRow>
</GridContainer>
```

| Component       | Main API                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------- |
| `GridContainer` | `size: fullwidth                                                                            | boxed | content | narrow | text`, responsive margin/padding props, hide flags, background color/image/gradient/video/YouTube with mobile overrides. |
| `GridRow`       | Same backgrounds/spacing plus `align`, `justify`, `equalHeight`, optional container `size`. |
| `GridCol`       | 12-column `span`, `smSpan`, `mdSpan`, mobile order, hide flags, and responsive backgrounds. |
| `GridStack`     | Dynamic `as` element with full-width stacked content and responsive backgrounds/media.      |

For background media, use `bg-image`, `bg-image-sm`, `bg-video`, `bg-video-sm`, `bg-youtube`, posters, gradients, and `bg-size`. The string `none` explicitly disables an inherited mobile media source.

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
Author: [Aliaksandr Ivanou](https://github.com/aleksivanou) — `aleksivanov.me@gmail.com`.

## License

Copyright © 2026 Aliaksandr Ivanou. All rights reserved.

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. Commercial use is not granted by that license. Read [LICENSE](LICENSE) before using, redistributing, or building on the project.
