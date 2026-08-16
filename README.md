# @myelophone/nuxt

Production-oriented Nuxt 4 + Tailwind CSS application framework and Nuxt layer with SSR/SSG, multilingual routing, consent-aware integrations, Pinia stores, SEO, security headers, performance tooling, and reusable responsive components library.

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

## What is @myelophone/nuxt

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
| `public.pageFullscreenPreloader` | `{}` / disabled  | Optional global full-screen route preloader component and overlay configuration.   |
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

## Ready page components

A ready page component is a complete, reusable page composition built from the layer's grid, UI, view, media, and content components. It owns its default content, markup, and visual preset, so a Nuxt page can render a finished page with a single component:

```vue
<template>
 <ReadyProductPage />
</template>
```

Keep ready page components in `app/components/ready/`. Nuxt derives the component name from the directory and filename: `components/ready/ProductPage.vue` becomes `<ReadyProductPage />`.

Ready components should contain only page-specific concerns:

- the content contract and other page-specific TypeScript interfaces;
- complete default content for every supported locale;
- the composition of existing components;
- named slots that are useful for exceptional site-specific replacements;
- the page's default CSS variables and the selectors that consume them.

Reusable behavior belongs to the layer rather than an individual ready component:

| API                   | Responsibility                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useReadyPage()`      | Resolves configured locales, applies fallbacks and overrides, stays reactive, and updates title, description, Open Graph title, and Open Graph description for the active language. |
| `mergeReadyContent()` | Deeply merges objects without mutating the defaults. Arrays are replaced as complete collections.                                                                                   |
| `readyCssVariables()` | Converts a typed appearance object into inheritable `--ready-*` CSS variables.                                                                                                      |
| `PageReadyLocalized`  | Renders the resolved language variant through `UiLangVisible`.                                                                                                                      |

Marketing and editorial content belongs in the ready component, not in locale JSON files. Keep JSON namespaces for shared interface or service strings used by independent components, such as email, telephone, consent, navigation controls, validation messages, and common actions.

### Minimal ready component

The following is a complete minimal `app/components/ready/ProductPage.vue`. Its specific types stay in the SFC and can be imported by a consuming page when type annotations are useful.

```vue
<script lang="ts">
import type {
 DeepPartial,
 ReadyContentByLocale,
} from "../../composables/useReadyPage";

export interface ProductPageContent {
 seo: {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
 };
 brand: string;
 hero: {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
 };
}

export interface ProductPageAppearance {
 background: string;
 text: string;
 primary: string;
 primaryContrast: string;
 buttonRadius: string;
}

export type ProductPageContentOverride = DeepPartial<ProductPageContent>;
export type ProductPageContentByLocale =
 ReadyContentByLocale<ProductPageContent>;
export type ProductPageAppearanceOverride = DeepPartial<ProductPageAppearance>;
</script>

<script setup lang="ts">
import {
 mergeReadyContent,
 readyCssVariables,
 useReadyPage,
} from "../../composables/useReadyPage";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
 defineProps<{
  content?: ProductPageContentOverride;
  contentByLocale?: ProductPageContentByLocale;
  appearance?: ProductPageAppearanceOverride;
 }>(),
 {
  content: () => ({}),
  contentByLocale: () => ({}),
  appearance: () => ({}),
 },
);

const english: ProductPageContent = {
 seo: {
  title: "Acme — a clearer way to work",
  description: "A short description of the complete product page.",
 },
 brand: "Acme",
 hero: {
  title: "A complete page from one component",
  description: "The component provides useful content and layout immediately.",
  actionLabel: "Get started",
  actionTo: "/contact",
 },
};

const defaultContentByLocale: Record<string, ProductPageContent> = {
 en: english,
 pl: mergeReadyContent(english, {
  seo: {
   title: "Acme — prostszy sposób pracy",
   description: "Krótki opis kompletnej strony produktu.",
  },
  hero: {
   title: "Kompletna strona z jednego komponentu",
   description: "Komponent od razu udostępnia treść i układ.",
   actionLabel: "Zacznij",
  },
 }),
};

const defaultAppearance: ProductPageAppearance = {
 background: "var(--ui-bg)",
 text: "var(--ui-text)",
 primary: "#526dff",
 primaryContrast: "#ffffff",
 buttonRadius: "0.75rem",
};

const appearance = computed(() =>
 mergeReadyContent(defaultAppearance, props.appearance),
);
const rootStyle = computed(() => readyCssVariables(appearance.value));

const { resolvedContentByLocale } = useReadyPage({
 contentByLocale: defaultContentByLocale,
 content: () => props.content,
 overridesByLocale: () => props.contentByLocale,
 fallbackLocale: "en",
});
</script>

<template>
 <PageReadyLocalized
  v-slot="{ content: page }"
  :content-by-locale="resolvedContentByLocale"
 >
  <section
   v-bind="$attrs"
   :style="[rootStyle, $attrs.style]"
   class="ready-product-page"
  >
   <GridContainer size="boxed" class="py-20">
    <p>{{ page.brand }}</p>
    <UiHeading :level="1">{{ page.hero.title }}</UiHeading>
    <p>{{ page.hero.description }}</p>
    <UiButton
     as="nuxt-link"
     :to="page.hero.actionTo"
     :label="page.hero.actionLabel"
     class="ready-product-page__button"
    />
   </GridContainer>
  </section>
 </PageReadyLocalized>
</template>

<style scoped>
.ready-product-page {
 background: var(--ready-background);
 color: var(--ready-text);
 min-height: 100dvh;
}

.ready-product-page :deep(.ready-product-page__button) {
 background: var(--ready-primary);
 border-color: var(--ready-primary);
 border-radius: var(--ready-button-radius);
 color: var(--ready-primary-contrast);
}
</style>
```

`useReadyPage()` reads the active language used by the built-in multi-language system. `PageReadyLocalized` delegates visible content to `UiLangVisible`; ready components should not manually inspect the route or duplicate locale-selection logic.

Each locale entry must describe a complete usable page after merging with its fallback. The example creates Polish content by deeply overriding the English fallback. Because arrays represent ordered page collections, `mergeReadyContent()` replaces an overridden array instead of merging items by index.

### Use and customize a ready page

No props are required when the defaults are suitable. A concrete site can change any nested value without editing or copying the ready component:

```vue
<script setup lang="ts">
import type { ProductPageContentByLocale } from "~/components/ready/ProductPage.vue";

const contentByLocale: ProductPageContentByLocale = {
 en: {
  brand: "Example Cloud",
  hero: {
   title: "Infrastructure without busywork",
  },
 },
 pl: {
  brand: "Example Cloud",
  hero: {
   title: "Infrastruktura bez zbędnej pracy",
  },
 },
};
</script>

<template>
 <ReadyProductPage
  :content="{
   hero: {
    actionTo: 'mailto:hello@example.com',
   },
  }"
  :content-by-locale="contentByLocale"
  :appearance="{
   primary: '#7c3aed',
   buttonRadius: '999px',
  }"
  class="site-product-page"
 />
</template>
```

Overrides are applied in this order:

1. the ready component's fallback content;
2. the ready component's content for the active language;
3. common site overrides from `content`;
4. active-language site overrides from `contentByLocale`.

Use `content` for values shared by every language, such as URLs, email addresses, feature flags, IDs, and asset paths. Use `contentByLocale` for language-dependent editorial content. Both objects are reactive, so replacing either prop updates the rendered page and its SEO metadata.

The `appearance` prop exposes the variables intentionally supported by that ready component. Normal root attributes are also forwarded. This permits site-specific classes, `data-*`, `aria-*`, and additional or emergency CSS-variable overrides:

```vue
<ReadyProductPage
 data-campaign="autumn"
 style="--ready-primary: #e11d48; --ready-button-radius: 0.4rem"
/>
```

Define every documented appearance variable on the ready component's root and consume it inside the component with `var(--ready-...)`. CSS custom properties inherit through nested Vue components, while `:deep()` lets scoped ready styles target the roots of reused UI components. Prefer `appearance` for the stable public styling API and direct `style` variables for exceptional additions.

### Ready component checklist

When adding another complete page or large ready page fragment:

1. Create a descriptive file under `app/components/ready/`.
2. Keep its content and appearance interfaces in that `.vue` file; do not add ready-specific contracts to the global `app/types/` directory.
3. Provide a complete fallback locale and all useful built-in locale variants inside the component.
4. Include `seo.title` and `seo.description`; add localized `ogTitle` and `ogDescription` only when they should differ.
5. Accept `content`, `contentByLocale`, and `appearance` as deep partial overrides.
6. Call `useReadyPage()` instead of implementing merging, locale selection, fallback, or SEO again.
7. Render the result through `PageReadyLocalized` so visibility continues to use `UiLangVisible`.
8. Put visual defaults in a typed appearance object, convert it with `readyCssVariables()`, and bind the result to the root element.
9. Forward `$attrs` and merge `$attrs.style` after the default root variables.
10. Add named slots only where arbitrary site markup is genuinely useful; prefer typed content overrides for normal changes.
11. Add a separate route under `playground/pages/` for development. Do not replace framework or application pages merely to demonstrate the component.
12. Run type checking and a production build before considering the ready component complete.

## Reveal animations

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

| Source page        | English, the default locale | Polish               | Russian              |
| ------------------ | --------------------------- | -------------------- | -------------------- |
| `/`                | `/`                         | `/pl`                | `/ru`                |
| `/about`           | `/about`                    | `/pl/about`          | `/ru/about`          |
| `/products/[slug]` | `/products/:slug`           | `/pl/products/:slug` | `/ru/products/:slug` |

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

| Member                        | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `t(key)`                      | Translate a string                                           |
| `t(key, params)`              | Replace `{placeholder}` values                               |
| `t(key, count)`               | Select a plural form and format `{count}`                    |
| `t(key, params, count)`       | Combine interpolation and pluralization                      |
| `t(key, params, count, rule)` | Force a plural suffix such as `few` or `many`                |
| `tn(key, count, params?)`     | Use compact number formatting such as `12K` for large counts |
| `loadPromise`                 | Reactive namespace-loading state                             |
| `refresh()`                   | Reload the selected namespaces through Nuxt async data       |

Plural keys use the suffixes returned by `Intl.PluralRules`, such as `_one`, `_few`, `_many`, and `_other`. For zero, `_zero` is checked first. `_other` is the final plural fallback.

```ts
const { t, tn } = useMultiLang("products");

t("products.hello", { name: "Ada" });
t("products.items", 0); // products.items_zero
t("products.items", { category: "books" }, 3);
t("products.items", {}, 3, "few"); // explicitly use products.items_few
tn("products.items", 12_500); // compact, locale-aware {count}
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
  titleKey: "products.dynamic_title",
  emptyStateKeys: ["products.empty.search", "products.empty.category"],
  sections: [{ headingKey: "products.sections.featured" }],
 },
 { safelistPath: "i18n-safelist.json" },
);
```

`useSafeList` recursively collects:

- direct translation-key strings;
- object properties whose names end in `Key`, except `loadKey`;
- arrays stored in properties whose names end in `Keys`;
- matching values inside nested arrays and objects.

It is intended for server/build-time code because it uses the Node filesystem. Without options it writes sorted keys to `.nuxt/i18n-safelist.generated.json`. To feed collected keys directly into the configured tree-shaker, set `safelistPath: 'i18n-safelist.json'` as above. The same root file can also be maintained manually:

```json
["products.dynamic_title", "products.empty.search", "products.empty.category"]
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

const selectPolish = () => settings.setLocale("pl");
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
- `SeoProfileInfo`, `SeoOrgInfo`, and `SeoBrandInfo` emit reactive SSR JSON-LD records;
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

### Profile, organization, and brand JSON-LD

`SeoProfileInfo`, `SeoOrgInfo`, and `SeoBrandInfo` are head-only components: they render no visible element and add an SSR-accessible `<script type="application/ld+json">` record to `<head>`. Values remain reactive during client navigation. JSON is escaped so supplied text cannot prematurely close the script element.

Use `SeoProfileInfo` only when the page primarily describes one person or organization. Google requires `mainEntity` and a `name` or `alternateName` on that entity for ProfilePage eligibility. The shorthand entity props cover Google's common fields; `entity` accepts every additional `Person` or `Organization` property:

```vue
<SeoProfileInfo
 id="https://example.com/team/ada#profile-page"
 url="https://example.com/team/ada"
 name="Ada Lovelace — profile"
 date-created="2024-01-10T09:00:00Z"
 date-modified="2026-08-16T12:00:00Z"
 entity-id="https://example.com/team/ada#person"
 entity-name="Ada Lovelace"
 alternate-name="@ada"
 entity-description="Lead platform engineer"
 entity-image="https://example.com/images/ada.webp"
 :same-as="['https://github.com/ada', 'https://www.linkedin.com/in/ada']"
 :interaction-statistic="[
  {
   '@type': 'InteractionCounter',
   interactionType: 'https://schema.org/FollowAction',
   userInteractionCount: 1250,
  },
 ]"
 :entity="{
  jobTitle: 'Lead platform engineer',
  worksFor: { '@id': 'https://example.com/#organization' },
  knowsAbout: ['Nuxt', 'Accessibility'],
 }"
 :data="{
  isPartOf: { '@id': 'https://example.com/#website' },
 }"
/>
```

If a complete entity object already exists, pass it as `main-entity`; it replaces the generated entity:

```vue
<SeoProfileInfo
 :main-entity="{
  '@type': 'Organization',
  '@id': 'https://example.com/#organization',
  name: 'Example Studio',
  url: 'https://example.com/',
 }"
/>
```

For a single JSON-LD script with an `@graph`, set `entity-only` to make the profile's root node a `Person` or `Organization`, then pass every related node through `graph`. This covers graph structures containing a person, company, nested brand, WebSite, FAQPage, and any other Schema.org records:

```vue
<script setup lang="ts">
const personId = "https://aleksivanov.me/#person";
const organizationId = "https://myeloph.one/#organization";

const relatedGraph = [
 {
  "@type": "Organization",
  "@id": organizationId,
  name: "MyelophOne",
  url: "https://myeloph.one/",
  legalName: "Aliaksandr Ivanou",
  founder: { "@id": personId },
  brand: {
   "@type": "Brand",
   name: "MyelophOne",
  },
 },
 {
  "@type": "WebSite",
  "@id": "https://aleksivanov.me/#website",
  name: "Aleks Ivanou",
  url: "https://aleksivanov.me/",
  publisher: { "@id": personId },
 },
 {
  "@type": "FAQPage",
  "@id": "https://aleksivanov.me/#faq",
  mainEntity: [
   {
    "@type": "Question",
    name: "Who is Aleks Ivanou?",
    acceptedAnswer: {
     "@type": "Answer",
     text: "A full-stack developer and founder of MyelophOne.",
    },
   },
  ],
 },
];
</script>

<template>
 <SeoProfileInfo
  entity-only
  :id="personId"
  entity-type="Person"
  name="Aliaksandr Ivanou"
  :alternate-name="['Aleks Ivanou', 'Alex Ivanou', '@aleksivanou']"
  url="https://aleksivanov.me/"
  image="https://aleksivanov.me/assets/img/portrait.jpg"
  job-title="Full-stack developer"
  email="mailto:aleks@example.com"
  description="Full-stack developer and founder of MyelophOne."
  :same-as="['https://github.com/aleksivanou']"
  :owns="{ '@id': organizationId }"
  :knows-about="['Nuxt.js', 'Vue.js', 'TypeScript', 'Go']"
  :graph="relatedGraph"
 />
</template>
```

The result is one script shaped as `{ "@context": "https://schema.org", "@graph": [...] }`. The generated profile/entity is the first graph node, followed by the supplied nodes. The `graph` prop is also available on `SeoOrgInfo` and `SeoBrandInfo`, so any of the three record types can be the primary node. When `graph` is omitted, the component continues to emit its normal standalone JSON-LD record.

Use `SeoOrgInfo` once on the home page or a page that describes the organization. Prefer the most specific applicable Schema.org subtype through `type`, such as `Corporation`, `OnlineStore`, or a suitable `LocalBusiness` subtype:

```vue
<SeoOrgInfo
 type="Corporation"
 id="https://example.com/#organization"
 name="Example Studio"
 alternate-name="Example"
 legal-name="Example Studio sp. z o.o."
 url="https://example.com/"
 description="Product design and engineering studio"
 telephone="+48-12-345-67-89"
 email="hello@example.com"
 :logo="{
  '@type': 'ImageObject',
  url: 'https://example.com/logo.png',
  width: 512,
  height: 512,
 }"
 :address="{
  '@type': 'PostalAddress',
  streetAddress: '1 Example Street',
  addressLocality: 'Warsaw',
  postalCode: '00-001',
  addressCountry: 'PL',
 }"
 :contact-point="{
  '@type': 'ContactPoint',
  contactType: 'customer support',
  telephone: '+48-12-345-67-89',
  availableLanguage: ['en', 'pl'],
 }"
 :same-as="[
  'https://github.com/example',
  'https://www.linkedin.com/company/example',
 ]"
 :data="{
  foundingDate: '2020-01-01',
  knowsLanguage: ['en', 'pl'],
 }"
/>
```

`SeoOrgInfo` has direct props for identity, names, URLs, logo/images, contacts, addresses, founders, employees, organization relationships, brands, service areas, ratings/reviews, offers, merchant policies, shipping services, awards, expertise, and common company identifiers (`taxID`, `vatID`, `duns`, `globalLocationNumber`, `iso6523Code`, `leiCode`, and `naics`).

`SeoBrandInfo` supports the complete Brand-specific set plus the commonly useful inherited Thing properties:

```vue
<SeoBrandInfo
 id="https://example.com/#brand"
 name="Example"
 alternate-name="Example Labs"
 url="https://example.com/"
 logo="https://example.com/brand.svg"
 slogan="Build clearly"
 :same-as="['https://www.wikidata.org/wiki/Q123']"
 :owner="{ '@id': 'https://example.com/#organization' }"
 :aggregate-rating="{
  '@type': 'AggregateRating',
  ratingValue: 4.9,
  reviewCount: 86,
 }"
/>
```

Common control props:

| Prop        | Default                | Purpose                                                                             |
| ----------- | ---------------------- | ----------------------------------------------------------------------------------- |
| `enabled`   | `true`                 | Reactively add or remove this JSON-LD script                                        |
| `context`   | `https://schema.org`   | JSON-LD `@context`                                                                  |
| `type`      | Component type         | JSON-LD `@type`; accepts a string or multiple types                                 |
| `id`        | —                      | Stable entity/page `@id`, normally an absolute URL with an optional fragment        |
| `data`      | `{}`                   | Any additional or future Schema.org properties for the root record                  |
| `graph`     | —                      | Wrap the generated record and additional nodes in one root `@graph` script          |
| `scriptKey` | Generated per instance | Override Nuxt head deduplication key when the record needs a stable application key |
| `scriptId`  | —                      | Optional HTML id on the generated script element                                    |

`data` is merged first; explicit component props override properties with the same name. `@context` and `@type` always come from their corresponding props. For `SeoProfileInfo`, `entity` is merged the same way for the generated `mainEntity`, while `mainEntity` supplies a fully custom entity and takes precedence over all shorthand entity fields. Set `entityOnly` when the root record itself must be the generated `Person` or `Organization`; in this mode the page-level `id`, `name`, `url`, `description`, and `image` props also act as fallbacks for their entity equivalents. This pass-through design supports all Schema.org properties, nested nodes, arrays, `@id` references, multi-typed records, and future vocabulary additions without waiting for a component update.

Always use absolute crawlable URLs, include only information represented by the visible page, and omit unknown data instead of inventing it. Validate deployed output with Google's Rich Results Test and the Schema.org validator; valid markup improves machine understanding but does not guarantee a rich result.

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

| State              | Synchronized fields                                            | Availability                        |
| ------------------ | -------------------------------------------------------------- | ----------------------------------- |
| Theme              | `settings.theme` and the applied `data-theme`/theme class      | Always enabled                      |
| Cookie preferences | `settings.cookiePreferences`, `settings.isCookieBannerVisible` | Always enabled                      |
| Cart               | `items`, `coupon`, `meta`, `currency`                          | When `public.stores.cart` is `true` |
| User               | `profile`, `session`, `status`, `error`, `lastAuthenticatedAt` | When `public.stores.user` is `true` |

For example, adding an item or applying a coupon in one tab updates the other open tabs. Changing the theme updates both the Pinia state and the rendered document theme. Logging in, refreshing a session, updating a profile, or logging out is reflected across tabs when the user store is enabled.

Cart exchange rates, calculation strategies, hooks, and store configuration are not broadcast. User-store configuration and the session-extender callback are also local to each tab. Only the fields listed above are synchronized.

#### Synchronize selected fields from another Pinia store

Cross-tab synchronization is built in and can be added to any Pinia store with one `useStoreBroadcast` call. Pass the store and list the state fields that should be shared; no custom `BroadcastChannel`, message protocol, watchers, or loop prevention is required.

`useStoreBroadcast` accepts a store, an explicit key allowlist, and an optional channel name:

```ts
const filters = useCatalogFiltersStore();

const stopSync = useStoreBroadcast(filters, {
 keys: ["query", "sort", "selectedCategories"],
 channel: "catalog-filters",
});

// Synchronization is now active for the component's lifetime.
// Cleanup is automatic; call stopSync() only to stop it earlier.
```

To synchronize another field later, add its state key to the same allowlist:

```ts
useStoreBroadcast(filters, {
 keys: ["query", "sort", "selectedCategories", "viewMode"],
});
```

Without `channel`, the channel name is `pinia:<store-id>`. Nested changes are watched deeply. Incoming values are applied with `$patch`, and source identifiers prevent a received update from being broadcast back in a loop.

Broadcast values must be serializable state composed of strings, numbers, booleans, `null`, arrays, and plain objects. Dates are transmitted as ISO strings. Functions, symbols, unsupported values, and circular references are converted to `null` and should not be included in the key list.

#### Synchronize standalone persisted state

`useStorage` enables tab synchronization by default. Set `syncTabs: false` for state that must remain isolated:

```ts
const sharedFilters = useStorage(
 "catalog-filters",
 { query: "", categories: [] as string[] },
 {
  storage: "local",
  syncTabs: true,
  deep: true,
 },
);

sharedFilters.value.value.query = "headphones";
```

Updates and `remove()` calls are propagated through a key-specific `BroadcastChannel`. For local storage, the native `storage` event provides an additional synchronization path.

#### Theme synchronization

Theme changes can be broadcast directly when a custom theme control does not use the settings store:

```ts
const { applyTheme } = useThemeSync();

applyTheme("dark");
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

| Component       | Responsibility                                                                       | Main props                                                                           |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `GridContainer` | Centers content, limits its maximum width, and adds default horizontal page padding. | `size`, `py`, `my`, `mdPy`, `mdMy`, visibility and background props                  |
| `GridRow`       | Creates a wrapping flex row and controls cross-axis and horizontal alignment.        | `size`, `align`, `justify`, `equalHeight`, spacing, visibility, and background props |
| `GridCol`       | Places content on the responsive 12-column grid.                                     | `span`, `smSpan`, `mdSpan`, `smOrder`, visibility, and background props              |
| `GridStack`     | Creates a full-width vertical wrapper for sections and layered backgrounds.          | `as`, visibility and background props                                                |

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

| Prop             | Values/default                                                            | Purpose                  |
| ---------------- | ------------------------------------------------------------------------- | ------------------------ |
| `as`             | Any HTML tag, default `div`                                               | Root element             |
| `hideOnMobile`   | `boolean`                                                                 | Hide below `768px`       |
| `hideOnDesktop`  | `boolean`                                                                 | Hide from `768px` upward |
| Background props | See [Backgrounds, gradients, and media](#backgrounds-gradients-and-media) | Full wrapper background  |

`GridStack` fills the available parent height by default. Give it an explicit Tailwind `h-*` class when the section needs a fixed, viewport-based, or responsive height.

#### `GridContainer`

`GridContainer` centers page content, applies a maximum width selected with `size`, and adds safe horizontal padding for every size except `fullwidth`. It is a vertical flex container, so utilities such as `justify-center` and `items-center` can position its children.

```vue
<GridContainer size="text" id="article-introduction" class="py-12 md:py-20">
	<UiHeading :level="1">Article title</UiHeading>
	<p class="mt-5 text-lg leading-8 text-gray-600">
		A readable text column centered within the page.
	</p>
</GridContainer>
```

Main props:

| Prop                            | Values/default                                                                                             | Purpose                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `size`                          | `fullwidth`, `full`, `boxed`, `laptop`, `content`, `medium`, `text`, `tablet`, `mobile`; default `content` | Maximum content width                   |
| `py`, `my`                      | Tailwind spacing suffix                                                                                    | Vertical padding or margin              |
| `mdPy`, `mdMy`                  | Tailwind spacing suffix                                                                                    | Vertical padding or margin from `768px` |
| `hideOnMobile`, `hideOnDesktop` | `boolean`                                                                                                  | Responsive visibility                   |
| Background props                | See [Backgrounds, gradients, and media](#backgrounds-gradients-and-media)                                  | Container background                    |

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

| Prop                            | Values/default                                                           | Purpose                                     |
| ------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------- |
| `size`                          | Any container size                                                       | Optional centered maximum width for the row |
| `align`                         | `start`, `center`, `end`, `stretch`; default `start`                     | Cross-axis column alignment                 |
| `justify`                       | `start`, `center`, `end`, `between`, `around`, `evenly`; default `start` | Horizontal distribution                     |
| `equalHeight`                   | `boolean`, default `false`                                               | Stretch sibling columns equally on desktop  |
| `py`, `my`, `mdPy`, `mdMy`      | Tailwind spacing suffix                                                  | Responsive vertical spacing                 |
| Visibility and background props | Shared grid API                                                          | Responsive visibility and row background    |

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

| Prop                            | Values/default                                                            | Purpose                                          |
| ------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `span`                          | `1`–`12`, default `12`                                                    | Desktop width in twelfths                        |
| `smSpan`                        | `1`–`12`                                                                  | Mobile width in twelfths; defaults to full width |
| `mdSpan`                        | `1`–`12`                                                                  | Explicit desktop width override                  |
| `smOrder`                       | `1`–`12`, `first`, `last`, `none`                                         | Mobile order, reset on desktop                   |
| `hideOnMobile`, `hideOnDesktop` | `boolean`                                                                 | Responsive visibility                            |
| Background props                | See [Backgrounds, gradients, and media](#backgrounds-gradients-and-media) | Column background                                |

#### Container sizes

`GridContainer` defaults to `content`. `GridRow` can also receive `size` when a row needs its own centered maximum width.

| `size` value | Maximum width                                | Typical use                                 |
| ------------ | -------------------------------------------- | ------------------------------------------- |
| `fullwidth`  | `100%`, without automatic horizontal padding | Edge-to-edge sections                       |
| `full`       | `100%`                                       | Full-width content with page padding        |
| `boxed`      | The smaller of `90%` and `1500px`            | Wide landing pages and dashboards           |
| `laptop`     | `1367px`                                     | Wide application layouts                    |
| `content`    | `1080px`                                     | Default pages and marketing sections        |
| `medium`     | `920px`                                      | Forms, feature content, and compact pages   |
| `text`       | `728px`                                      | Articles and long-form copy                 |
| `tablet`     | `600px`                                      | Narrow forms and dialogs presented as pages |
| `mobile`     | `480px`                                      | Authentication and single-column flows      |

Every size except `fullwidth` includes `px-4 md:px-0`. Use `full` when content must stay full width but still needs safe mobile page padding.

#### Responsive columns

| Prop      | Values                            | Behaviour                                                       |
| --------- | --------------------------------- | --------------------------------------------------------------- |
| `span`    | `1`–`12`, default `12`            | Column width from the `md` breakpoint (`768px`) upward          |
| `smSpan`  | `1`–`12`                          | Column width below `768px`; without it the column is full width |
| `mdSpan`  | `1`–`12`                          | Explicit desktop width override                                 |
| `smOrder` | `1`–`12`, `first`, `last`, `none` | Mobile order; normal source order is restored from `768px`      |

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

| Prop         | Generated utility |
| ------------ | ----------------- |
| `py="12"`    | `py-12`           |
| `my="8"`     | `my-8`            |
| `md-py="20"` | `md:py-20`        |
| `md-my="12"` | `md:my-12`        |

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

| Desktop/default prop | Mobile override   | Purpose                                      |
| -------------------- | ----------------- | -------------------------------------------- |
| `bgColor`            | —                 | Any CSS background color                     |
| `bgImage`            | `bgImageSm`       | Image URL                                    |
| `bgGradient`         | `bgGradientSm`    | CSS gradient placed over the image or video  |
| `bgSize`             | `bgSizeSm`        | CSS background size; defaults to `cover`     |
| `bgVideo`            | `bgVideoSm`       | Muted, looping local background video        |
| `bgVideoPoster`      | `bgVideoPosterSm` | Poster shown while a local video loads       |
| `bgYoutube`          | `bgYoutubeSm`     | YouTube video ID or URL used as a background |

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
| `UiConsole`          | Responsive animated console with delayed/removable lines, highlighted segments, looping, slots, and controls.       |
| `UiCursorCreative`   | Optional animated desktop cursor; disables itself for coarse pointers and reduced motion.                           |
| `UiFeatureAccordion` | Feature list synchronized with an image; side/mobile ordering and optional links.                                   |
| `UiFileUpload`       | Native/FormData-compatible file picker and dropzone; single/multiple files, validation, previews, removal, slots.   |
| `UiGeoDependent`     | Show slot using country whitelist/blacklist and optional pre-resolved `geoData`.                                    |
| `UiHeading`          | Semantic `h1`–`h6` with independent `xs`–`display` visual size and custom class.                                    |
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
| `UiSkeleton`         | Theme-aware loading placeholder; `as`, `animated`, `rounded`, `width`, `height`, and optional accessible label.     |
| `UiSmartContrast`    | Full background image/gradient wrapper with fixed/auto contrast modes and configurable height.                      |
| `UiSnapContainer`    | Vertical/horizontal controlled full-page snapping for `UiSnapSection` children.                                     |
| `UiSnapSection`      | Snap panel with image/video/YouTube mobile variants, poster, overlay, lazy loading, and content class.              |
| `UiSplitSection`     | Image/text split with side, container width, edge image, mobile reversal, and named text slot.                      |
| `UiStickyWrapper`    | Sticky slot with pixel offset; prepares its parent positioning.                                                     |
| `UiTable`            | Sortable table with nested keys and automatic virtualization above 100 rows; emits `sort`.                          |
| `UiTabs`             | Accessible vertical/horizontal tabs with configurable side, width, alignment, slots, and animated panels.           |
| `UiTextarea`         | `v-model` textarea with floating label, error state, clear/save controls and `save`/`clear` events.                 |
| `UiTextColumn`       | Typography/spacing wrapper for prose slots.                                                                         |
| `UiToggler`          | Accessible boolean `v-model` switch with label and disabled state.                                                  |
| `UiTruncateText`     | Responsive character limits with localized expand/collapse controls. Text-only slot.                                |
| `UiViewportSpacer`   | Responsive `vh/dvh` or `vw/dvw` spacer.                                                                             |

#### UiConsole

`UiConsole` renders plain strings or structured lines. All timing values are milliseconds. A line's `delay` is the wait after the preceding line appears; when omitted, `lineDelay` is used (the first line appears immediately). `hideAfter` removes that line after the specified time, which can be used for temporary status messages or line replacement.

```vue
<script setup lang="ts">
const output = [
 {
  prefix: "$",
  segments: [{ text: "npx telemetry " }, { text: "init", tone: "primary" }],
 },
 {
  prefix: "→",
  text: "Scanning service topology...",
  tone: "muted",
  delay: 500,
  hideAfter: 900,
 },
 {
  prefix: "→",
  delay: 1000,
  segments: [
   { text: "Found ", tone: "muted" },
   { text: "23 services", highlight: true },
  ],
 },
 { prefix: "✓", text: "Deployment complete", tone: "success" },
];
</script>

<template>
 <UiConsole
  :lines="output"
  :line-delay="350"
  :start-delay="200"
  title="deploy"
  cursor
  @complete="onComplete"
 />
</template>
```

Line and segment tones are `default`, `muted`, `primary`, `info`, `success`, `warning`, and `error`. Set `highlight: true` for a subtle background highlight. Content is rendered as text rather than HTML; for custom markup use the scoped `line` slot, which receives `{ line, index }`. The `prefix` slot receives the same scope.

Principal props:

| Prop                      | Type                           | Default           | Purpose                                                                  |
| ------------------------- | ------------------------------ | ----------------- | ------------------------------------------------------------------------ |
| `lines`                   | `Array<string \| ConsoleLine>` | Required          | Console output in display order                                          |
| `autoplay`                | `boolean`                      | `true`            | Animate the sequence after mount; when false, show all lines immediately |
| `lineDelay`               | `number`                       | `400`             | Default wait before each line after the first                            |
| `startDelay`              | `number`                       | `0`               | Wait before starting the sequence                                        |
| `loop` / `loopDelay`      | `boolean` / `number`           | `false` / `1200`  | Replay the sequence and wait between runs                                |
| `chrome`                  | `boolean`                      | `true`            | Show the console header and window controls                              |
| `title`                   | `string`                       | Empty             | Optional centered header title                                           |
| `cursor`                  | `boolean`                      | `false`           | Show a blinking cursor while the sequence is running                     |
| `autoScroll`              | `boolean`                      | `true`            | Keep the newest output visible when the body overflows                   |
| `minHeight` / `maxHeight` | CSS length                     | `12rem` / `32rem` | Responsive body height limits                                            |
| `ariaLabel`               | `string`                       | `Console output`  | Accessible name for the live log                                         |
| `ui`                      | `object`                       | `{}`              | Classes for `root`, `header`, `body`, `line`, and `cursor`               |

Events are `line-show(line, index)`, `line-hide(line, index)`, and `complete`. Exposed methods are `play()`, `reset()`, `showAll()`, and `scrollToLatest()`.

SSR always renders the complete final output. Crawlers, no-JS clients, and the original HTML therefore receive every console line. When the existing early head script changes `html.nojs` to `html.js`, CSS hides every pending line except the first without removing anything from the document. After mount, the component starts its client-side timeline and controls visibility reactively. This avoids a hydration mismatch while keeping the complete semantic HTML available for SEO.

When `cursor` is enabled, it occupies its own new line and remains visible after the sequence completes, ready for the next simulated command.

The default palette follows GitHub's light and dark code colors and switches using the project theme. Individual colors can be overridden with `--ui-console-bg`, `--ui-console-header-bg`, `--ui-console-text`, `--ui-console-muted`, `--ui-console-border`, `--ui-console-primary`, `--ui-console-info`, `--ui-console-success`, `--ui-console-warning`, and `--ui-console-error`. Visual transitions and cursor blinking are disabled by `prefers-reduced-motion`.

`UiSkeleton` can be sized with Tailwind classes like `USkeleton`, or with its `width` and `height` props:

```vue
<div class="space-y-3">
 <UiSkeleton class="h-5 w-2/3" />
 <UiSkeleton class="h-4 w-full" rounded="sm" />
 <UiSkeleton :width="48" :height="48" rounded="full" />
</div>
```

Numeric dimensions are pixels; strings accept any CSS length. The default skeleton is decorative and hidden from assistive technology. Set `aria-label="Loading profile"` when it should be announced as a status. Set `:animated="false"` for a static placeholder. Its color is derived from `--ui-bg` and `--ui-text`, and pulse animation is automatically disabled by `prefers-reduced-motion`.

#### UiTabs

`UiTabs` is vertical by default. `side="left"` places the tab list on the left and its content on the right; `side="right"` reverses them. Bind the selected item with `v-model` and pass a stable `value` for each item:

```vue
<script setup lang="ts">
const activeTab = ref("overview");
const tabs = [
 { label: "Overview", value: "overview", content: "General information" },
 { label: "Delivery", value: "delivery", content: "Delivery conditions" },
 { label: "Archive", value: "archive", disabled: true },
];
</script>

<template>
 <UiTabs
  v-model="activeTab"
  :items="tabs"
  side="left"
  tab-width="auto"
  align="start"
  tabs-width="14rem"
 >
  <template #panel="{ item }">
   <article>{{ item.content }}</article>
  </template>
 </UiTabs>
</template>
```

For tabs above or below the content, use horizontal orientation:

```vue
<UiTabs
 :items="tabs"
 orientation="horizontal"
 side="top"
 tab-width="auto"
 align="center"
/>
```

Props:

| Prop            | Type                             | Default            | Purpose                                                                                             |
| --------------- | -------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `items`         | `TabItem[]`                      | Required           | Tabs containing `label`, optional `value`, fallback `content`, `disabled`, and any custom slot data |
| `modelValue`    | `string \| number`               | —                  | Active item value; normally bound with `v-model`                                                    |
| `defaultValue`  | `string \| number`               | First enabled item | Initial value for uncontrolled use                                                                  |
| `orientation`   | `vertical \| horizontal`         | `vertical`         | Put the list beside the content or above/below it                                                   |
| `side`          | `left \| right \| top \| bottom` | `left` or `top`    | List position; vertical accepts left/right and horizontal accepts top/bottom                        |
| `tabWidth`      | `full \| auto`                   | `full`             | Fill the list width (or share a horizontal row) or use each heading's natural width                 |
| `align`         | `start \| center \| end`         | `start`            | Align tab headings within the tab-list area                                                         |
| `tabsWidth`     | CSS length                       | `16rem`            | Width reserved for the list in vertical mode                                                        |
| `loop`          | `boolean`                        | `true`             | Wrap keyboard navigation from the last enabled tab to the first and back                            |
| `stackOnMobile` | `boolean`                        | `true`             | Below 768 px, move a vertical list above the panel and make it horizontally scrollable              |
| `ariaLabel`     | `string`                         | `Tabs`             | Accessible name of the tab list                                                                     |
| `ui`            | `object`                         | `{}`               | Classes for `root`, `list`, `tab`, `activeTab`, and `panel`                                         |

The `tab` slot receives `{ item, index, active, disabled }`; the `panel` slot receives `{ item, index, value }`. Without slots, labels and `content` are rendered as text. `change` emits `(value, item, index)`, alongside the standard `update:modelValue` event.

Arrow keys follow the selected orientation, while `Home` and `End` select the first or last enabled tab. The panel uses a short fade-and-slide transition; `prefers-reduced-motion` disables it. Colors are derived from the theme's `--ui-bg` and `--ui-text` variables.

#### UiFileUpload

`UiFileUpload` uses the same `v-model` pattern as the other form controls. A single field returns `File | null`; `multiple` returns `File[]`. Its native input retains `name`, `required`, `accept`, `capture`, and `disabled`, and is synchronized so `new FormData(form)` includes the current files.

Complete multiple-file form example:

```vue
<script setup lang="ts">
const attachments = ref<File[]>([]);
const uploadError = ref("");

const rejectFiles = (items: Array<{ file: File; reasons: string[] }>) => {
 uploadError.value = items
  .map(({ file, reasons }) => `${file.name}: ${reasons.join(", ")}`)
  .join("; ");
};

const submit = async (event: Event) => {
 const form = event.currentTarget as HTMLFormElement;
 await useApi().post("/contact", new FormData(form));
};
</script>

<template>
 <form @submit.prevent="submit">
  <UiFileUpload
   v-model="attachments"
   name="attachments[]"
   label="Attachments"
   description="PDF or images, up to 5 MB each"
   accept="application/pdf,image/*"
   :max-size="5 * 1024 * 1024"
   :max-files="4"
   :error="uploadError"
   multiple
   required
   @reject="rejectFiles"
  />
  <UiButton type="submit">Send</UiButton>
 </form>
</template>
```

For a single file, use `const avatar = ref<File | null>(null)` and omit `multiple`.

Props:

| Prop          | Type                             | Default                      | Purpose                                                                                                  |
| ------------- | -------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `File \| File[] \| null`         | `null`                       | Selected file for a single field or files for `multiple`; normally bound with `v-model`                  |
| `id`          | `string`                         | Generated                    | Native input id and base for accessible description/error ids                                            |
| `name`        | `string`                         | —                            | Native form field name; use a server-compatible name such as `attachments[]` for multiple files          |
| `accept`      | `string`                         | —                            | Comma-separated MIME types, wildcards, or extensions, for example `image/*,.pdf`                         |
| `multiple`    | `boolean`                        | `false`                      | Switch the model and native input to multiple-file mode                                                  |
| `required`    | `boolean`                        | `false`                      | Apply native required-field validation                                                                   |
| `disabled`    | `boolean`                        | `false`                      | Disable selection, dropping, removal, and keyboard interaction                                           |
| `capture`     | `boolean \| user \| environment` | —                            | Pass the native mobile capture hint to the file input                                                    |
| `dropzone`    | `boolean`                        | `true`                       | Enable drag-and-drop; `false` also renders the picker in its compact form                                |
| `interactive` | `boolean`                        | `true`                       | Make the whole picker clickable and keyboard-operable; the actions button remains available when `false` |
| `preview`     | `boolean`                        | `true`                       | Render selected files and image object-URL thumbnails                                                    |
| `append`      | `boolean`                        | `true`                       | Append new selections in multiple mode; set `false` to replace the array                                 |
| `maxSize`     | `number`                         | —                            | Maximum size of each file in bytes                                                                       |
| `maxFiles`    | `number`                         | —                            | Maximum accepted file count in multiple mode                                                             |
| `label`       | `string`                         | `Upload files`               | Main picker label                                                                                        |
| `description` | `string`                         | Empty                        | Supporting instructions; linked to the native input with `aria-describedby`                              |
| `selectText`  | `string`                         | `Select files`               | Default action text                                                                                      |
| `emptyText`   | `string`                         | `or drag and drop them here` | Default dropzone hint when no custom description is provided                                             |
| `layout`      | `list \| grid`                   | `list`                       | Selected-file presentation; `grid` is useful for image previews                                          |
| `error`       | `boolean \| string`              | `false`                      | Invalid styling; a string is also rendered as an accessible error message                                |

Events:

| Event               | Payload                                    | When it fires                                                             |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `update:modelValue` | `File \| File[] \| null`                   | Selection, removal, clear, or native form reset updates the model         |
| `change`            | `File \| File[] \| null`                   | The committed value changes, including clear and form reset               |
| `reject`            | `Array<{ file: File; reasons: Reason[] }>` | One or more incoming files fail validation                                |
| `remove`            | `file: File, index: number`                | A specific selected file is removed                                       |
| `clear`             | None                                       | `clear()` or `removeFile()` without an index clears a non-empty selection |

`Reason` is one of `type`, `size`, `count`, or `duplicate`. Valid files in a mixed selection are still accepted; rejected files are reported separately.

Scoped slots:

| Slot           | Scope                                          | Purpose                                                                      |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `default`      | `{ files, open, removeFile, clear, dragging }` | Replace the entire visible picker/dropzone content                           |
| `leading`      | —                                              | Replace the default upload icon                                              |
| `label`        | —                                              | Replace the label markup                                                     |
| `description`  | —                                              | Replace instructions or file constraints                                     |
| `actions`      | `{ files, open, removeFile }`                  | Replace the select-file action                                               |
| `files-top`    | `{ files, removeFile, clear }`                 | Insert content above the selected-file collection                            |
| `files`        | `{ files, removeFile, clear }`                 | Replace the complete selected-file collection                                |
| `file`         | `{ file, index, removeFile, previewUrl }`      | Replace one selected-file row/card; `previewUrl` exists for supported images |
| `files-bottom` | `{ files, removeFile, clear }`                 | Insert controls or status below the selected-file collection                 |

Exposed methods and refs:

| Member       | Signature/value            | Purpose                                                                       |
| ------------ | -------------------------- | ----------------------------------------------------------------------------- |
| `open`       | `() => void`               | Open the native file chooser                                                  |
| `removeFile` | `(index?: number) => void` | Remove a file by index, or clear all when omitted                             |
| `clear`      | `() => void`               | Clear all selected files                                                      |
| `input`      | Native input template ref  | Access the underlying `<input type="file">` when integration code requires it |

The picker listens to its parent form's native `reset` event and clears the model automatically. Image preview object URLs are revoked when files are removed or the component unmounts. Colors come from `--ui-bg` and `--ui-text`, while validation uses `--ui-error` with a fallback. Motion transitions are disabled under `prefers-reduced-motion`.

`useApi().post()` and `useApi().put()` accept the resulting `FormData`. The request helper removes its JSON content type for `FormData`, allowing the browser to generate the required multipart boundary. Do not set `Content-Type` manually for these requests.

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
<UiAlert
 variant="success"
 title="Saved"
 description="Your changes are live."
 closable
/>
<UiBadge label="New" color="blue" variant="soft" />
<UiBanner
 title="Scheduled maintenance"
 description="Sunday at 02:00 UTC"
 closable
/>
<UiChip text="3" color="red"><UiAvatar name="Ada Lovelace" /></UiChip>
<UiCommandPalette />
<UiCursorCreative />
<UiFeatureAccordion :items="features" default-image="/images/feature.webp" />
<UiIcon8 icon="github" type="color" :size="48" />
<UiLightBox :images="['/gallery/one.webp', '/gallery/two.webp']" />
<UiLocalTime timezone="Europe/Warsaw" label="Warsaw" show-date />
<UiPopup id="welcome-offer" title="Welcome" trigger-delay="1500" />
<UiRelativeTime :date="publishedAt" />
<UiScheduledContent
 from="2026-12-01T00:00:00Z"
 to="2026-12-31T23:59:59Z"
>Holiday offer</UiScheduledContent>
<UiScrollToTop />
<UiSegmentedControl v-model="period" :options="periodOptions" />
<UiSmartContrast
 src="/images/cover.webp"
 height="70vh"
><UiHeading :level="1">Readable cover</UiHeading></UiSmartContrast>
<UiSnapContainer
 direction="vertical"
><UiSnapSection id="intro" bg-image="/images/intro.webp">Intro</UiSnapSection></UiSnapContainer>
<UiSplitSection
 image-src="/images/team.webp"
 image-alt="Our team"
><template #text>Team story</template></UiSplitSection>
<UiStickyWrapper :offset="96">Sticky navigation</UiStickyWrapper>
<UiTextarea
 v-model="message"
 id="message"
 label="Message"
 buttons-position="outside"
 @save="submit"
/>
<UiTextColumn
 text-size-class="text-lg"
>Long-form readable content</UiTextColumn>
<UiToggler v-model="enabled" label="Enable notifications" />
<UiTruncateText
 :mobile-limit="120"
 :desktop-limit="300"
>Long text to truncate…</UiTruncateText>
<UiViewportSpacer size="20" mobile-size="12" />
```

### Content and view components

| Component                  | Purpose and principal props/events                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ViewAnimatedCounter`      | Intersection-driven counter: from/to, duration, decimals, prefix/suffix, separator, once.               |
| `ViewAnnouncementBar`      | Sticky/closable colored announcement with title/default/actions slots.                                  |
| `ViewAvatarGroup`          | Overlapping `UiAvatar` children with size, max count, and remainder badge.                              |
| `ViewBreadcrumbs`          | Localized generated breadcrumbs with truncation and separator.                                          |
| `ViewContentWithToc`       | Builds an anchor navigation from slotted h2/h3/h4/heading components.                                   |
| `ViewCopyright`            | Owner, optional start year, and localized “all rights reserved”.                                        |
| `ViewCountdownTimer`       | Timezone-aware target countdown; exposes values to a slot and emits `finish`.                           |
| `ViewCreativeCTA`          | Image/gradient CTA with alignment, two links, and title/description/actions slots.                      |
| `ViewCurrencySelect`       | Cart-backed currency picker with class overrides and trigger slot.                                      |
| `ViewFeatureBoxGrid`       | Linked feature cards with icons, 2–4 columns, layout direction, and description alignment.              |
| `ViewHorizontalMenu`       | Horizontally scrollable route menu with edge fade masks.                                                |
| `ViewImageCompare`         | Mouse/touch before-after image slider with optional labels.                                             |
| `ViewImgSlider`            | Image/video carousel with autoplay interval, manual controls, and vertical mode.                        |
| `ViewInfiniteMarquee`      | Seamless repeated string items with duration, delay, and container class.                               |
| `ViewInfoBar`              | Compact information items and actions with icons/callbacks.                                             |
| `ViewLogoGrid`             | Linked logos with color/grayscale variants and mobile item limit.                                       |
| `ViewLogoSlider`           | Infinite logo strip with speed, grayscale, and container class.                                         |
| `ViewPartialBackground`    | Full-width themed background with independent content width and left/right edge heights.                |
| `ViewQuoteBig`             | Large quotation with author/avatar, alignment, and typography controls.                                 |
| `ViewResponsiveMenu`       | Measures available width and moves overflowed route items into a dropdown.                              |
| `ViewReviewsSlider`        | Responsive draggable review carousel with autoplay and links.                                           |
| `ViewSocialBar`            | Iconify social links with five variants, size, gap, target, and per-item color.                         |
| `ViewStickyHeadingContent` | Two-column section with a configurable sticky `UiHeading` beside scrolling content.                     |
| `ViewTallyForm`            | Tally standard embed, popup, or fullscreen mode; hidden fields, theme colors/options; exposed `open()`. |
| `ViewWarningOutdated`      | Full-screen unsupported-browser warning; mounted globally when core APIs are missing.                   |

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
<ViewAvatarGroup
 :max="4"
><UiAvatar v-for="person in team" :key="person.id" :src="person.avatar" /></ViewAvatarGroup>
<ViewContentWithToc><article><h2>Installation</h2><p>...</p></article></ViewContentWithToc>
<ViewCopyright owner="MyelophOne" :start-year="2024" />
<ViewCountdownTimer target-date="2027-01-01T00:00:00Z" timezone="UTC" />
<ViewCreativeCTA
 title="Start building"
 primary-text="Get started"
 primary-link="/start"
/>
<ViewCurrencySelect />
<ViewFeatureBoxGrid :items="features" :columns="3" />
<ViewHorizontalMenu
 :items="[
  { label: 'Overview', path: '/' },
  { label: 'Docs', path: '/docs' },
 ]"
/>
<ViewImageCompare
 before-image="/before.webp"
 after-image="/after.webp"
 before-label="Before"
 after-label="After"
/>
<ViewImgSlider
 :media="slides"
 :auto-scroll="true"
 :auto-scroll-interval="5000"
/>
<ViewInfiniteMarquee :items="['Nuxt', 'Vue', 'Tailwind']" :duration="24" />
<ViewInfoBar :items="contactItems" :actions="contactActions" />
<ViewLogoGrid title="Trusted by teams" :items="logos" />
<ViewLogoSlider :logos="logos" :speed="30" grayscale />
<ViewPartialBackground
 container-size="boxed"
 background="url('/images/hero.webp') center / cover no-repeat"
 background-dark="linear-gradient(rgb(0 0 0 / 35%), rgb(0 0 0 / 35%)), url('/images/hero.webp') center / cover no-repeat"
 background-height-left="58dvh"
 background-height-right="66dvh"
 min-height="80dvh"
 content-align="center"
 content-class="py-16"
>
 <GridRow>
  <GridCol :span="8">Content over the partial background</GridCol>
 </GridRow>
</ViewPartialBackground>

<ViewPartialBackground
 background-after-content
 background-after-content-height="16dvh"
 background-height-left="100%"
 background-height-right="72%"
 background-color="#f59e0b"
 background-color-dark="#7c3aed"
>
 <GridRow>
  <GridCol>Content keeps its natural height; the image starts below it.</GridCol>
 </GridRow>
</ViewPartialBackground>

<ViewPartialBackground
 background-before-content
 background-before-content-height="14dvh"
 background-height-left="70%"
 background-height-right="100%"
 background-color="#38bdf8"
 background-color-dark="#075985"
>
 <GridRow>
  <GridCol>The angled background starts before this content.</GridCol>
 </GridRow>
</ViewPartialBackground>
<ViewQuoteBig text="A product-defining result." author-name="Ada Lovelace" />
<ViewResponsiveMenu :items="navigation" />
<ViewReviewsSlider :items="reviews" />
<ViewSocialBar :items="socialLinks" variant="rounded" size="lg" />
<ViewWarningOutdated />
```

#### `ViewPartialBackground`

`ViewPartialBackground` is a full-width section built with `GridStack` and `GridContainer`. Without a minimum height, its content area has natural content-driven height. The background edge and the content width are controlled independently.

| Prop                                                       | Values/default                                    | Purpose                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `containerSize`                                            | Any `GridContainer` size; default `content`       | Width of the inner content                                                     |
| `minHeight`                                                | Any CSS size; unset by default                    | Optional minimum content height                                                |
| `contentAlign`                                             | `top`, `center`, `bottom`; default `top`          | Vertical content alignment when `minHeight` creates free space                 |
| `backgroundHeightLeft`, `backgroundHeightRight`            | Any CSS size; default `60dvh`                     | Visible background height at each side; different values create an angled edge |
| `backgroundBeforeContent`                                  | `boolean`                                         | Add an angled background extension before the content                          |
| `backgroundBeforeContentHeight`                            | Any CSS size; default `clamp(5rem, 12dvh, 10rem)` | Total height reserved for the extension before content                         |
| `backgroundAfterContent`                                   | `boolean`                                         | Add an angled background extension after the content                           |
| `backgroundAfterContentHeight`                             | Any CSS size; default `clamp(5rem, 12dvh, 10rem)` | Total height reserved for the extension after content                          |
| `backgroundColor`, `backgroundColorDark`                   | Any CSS color                                     | Shared light/dark color for the content area and before/after extensions       |
| `background`, `backgroundDark`                             | Any CSS `background` value                        | Light/dark color, gradient, or image on the decorative layer                   |
| `backgroundSize`, `backgroundPosition`, `backgroundRepeat` | CSS background values                             | Decorative background rendering                                                |
| `mask`, `maskDark`                                         | Any CSS `mask` value                              | Light/dark mask on the decorative layer                                        |
| `maskSize`, `maskPosition`, `maskRepeat`                   | CSS mask values                                   | Decorative mask rendering                                                      |
| `contentClass`, `layerClass`                               | CSS/Tailwind class string                         | Inner container and decorative layer customization                             |

Both before/after heights accept `px`, `rem`, `vh`, `dvh`, `clamp()`, `min()`, `max()`, CSS variables, and other valid CSS lengths. Prefer `clamp()` for a responsive height with safe limits:

```vue
<ViewPartialBackground
 background-after-content
 background-after-content-height="clamp(4rem, 10dvh, 8rem)"
 background-height-left="100%"
 background-height-right="70%"
 background-color="#f59e0b"
 background-color-dark="#7c3aed"
>
 Content
</ViewPartialBackground>
```

The values are reactive. Bind a ref or computed CSS value to change the height at runtime:

```vue
<script setup lang="ts">
const lowerBackgroundHeight = ref("8rem");
</script>

<template>
 <ViewPartialBackground
  background-after-content
  :background-after-content-height="lowerBackgroundHeight"
 >
  Content
 </ViewPartialBackground>
</template>
```

When `backgroundBeforeContent` and `backgroundAfterContent` are both enabled, both extensions are rendered and their heights remain independent. The `background-before` and `background-after` slots can customize them separately; the shared `background` slot is used as fallback for either side.

#### `ViewStickyHeadingContent`

`ViewStickyHeadingContent` uses `GridContainer`, `GridRow`, and `GridCol` to place a sticky `UiHeading` beside a content column. The heading remains sticky only inside the height of the adjacent content. On mobile, the heading stays first in document order even when it is configured on the right for desktop.

```vue
<ViewStickyHeadingContent
 title="Forming lasting partnerships"
 heading-side="left"
 :heading-level="2"
 heading-size="xl"
 :heading-span="5"
 :content-span="7"
 sticky-from="md"
 sticky-offset="5rem"
 container-size="boxed"
 container-class="py-20"
 content-class="space-y-8 text-xl leading-relaxed"
>
 <p>First long content block…</p>
 <p>More content that scrolls beside the sticky heading…</p>
</ViewStickyHeadingContent>
```

Main props:

| Prop                                       | Values/default                                        | Purpose                                                          |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------- |
| `title`                                    | `string`                                              | Default heading text; replace with the `heading` slot for markup |
| `headingSide`                              | `left`, `right`; default `left`                       | Desktop heading side; the heading remains first on mobile        |
| `headingLevel`                             | `1`–`6`; default `2`                                  | Semantic heading element passed to `UiHeading`                   |
| `headingSize`                              | `xs`, `sm`, `md`, `lg`, `xl`, `display`; default `lg` | Visual size passed independently to `UiHeading`                  |
| `headingSpan`                              | `1`–`12`; default `5`                                 | Desktop heading-column width                                     |
| `contentSpan`                              | `1`–`12`; default `7`                                 | Desktop content-column width                                     |
| `containerSize`                            | Any `GridContainer` size; default `content`           | Overall content width                                            |
| `sticky`                                   | `boolean`; default `true`                             | Enable or disable sticky positioning                             |
| `stickyFrom`                               | `always`, `sm`, `md`, `lg`; default `lg`              | Breakpoint from which sticky positioning applies                 |
| `stickyOffset`                             | Any CSS length; default `6rem`                        | Distance from the top of the viewport while sticky               |
| `containerClass`, `rowClass`               | Class strings                                         | Grid container and row customization                             |
| `headingColumnClass`, `contentColumnClass` | Class strings                                         | Individual grid-column customization                             |
| `headingClass`, `contentClass`             | Class strings                                         | Heading and content typography/customization                     |

Slots:

| Slot            | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `heading`       | Heading contents rendered inside `UiHeading`       |
| `heading-after` | Optional content directly below the sticky heading |
| `default`       | Main scrolling content column                      |

Set `heading-side="right"` to swap the desktop columns. Set `:sticky="false"` when the same layout is needed without sticky behaviour.

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
| `SeoProfileInfo`                       | SSR ProfilePage JSON-LD with a Person or Organization main entity.                             |
| `SeoOrgInfo`                           | SSR Organization/subtype JSON-LD with common props and unrestricted data pass-through.         |
| `SeoBrandInfo`                         | SSR Brand JSON-LD with ratings, identity fields, and unrestricted data pass-through.           |
| `SeoNoIndex` / `SeoContentNoIndex`     | Page and content indexing controls.                                                            |
| `PagePreloader`                        | Route-loading overlay driven by the settings store.                                            |
| `PageFullscreenPreloader`              | Full-viewport themed overlay with centered arbitrary slot content.                             |
| `MyelophoneWelcome`                    | Default framework playground landing page.                                                     |
| `MyelophoneCopyright`                  | Server-rendered copyright island used by the framework welcome screen.                         |

```vue
<SafeEmail user="hello" domain="example" tld="com" subject="Website enquiry" />
<SafeImgWithLoader
 src="/images/product.webp"
 alt="Product"
 width="1200"
 height="800"
/>
<SafeNuxtPicture src="/images/hero.webp" alt="Hero" sizes="100vw md:1080px" />
<CookieBanner />
<CookieSettingsModal />
<PagePreloader />
<PageFullscreenPreloader>
 <BrandLoader />
</PageFullscreenPreloader>
<MyelophoneWelcome />
<NuxtIsland name="MyelophoneCopyright" />
```

### Full-screen page preloader

`PageFullscreenPreloader` is independent from the existing `PagePreloader`. The existing component keeps its original store-driven purpose. The new component covers the viewport and centers arbitrary slot content such as an SVG logo, icon, text, GIF, animation, or a custom loader component.

By default, no global full-screen preloader is enabled. To use one for route transitions across the whole site, configure an auto-imported component by name in the optional `myelophone.ts` file:

```ts
export default defineNuxtConfig({
 runtimeConfig: {
  public: {
   pageFullscreenPreloader: {
    component: "SitePreloaderLogo",
    props: {
     label: "Acme Studio",
    },
    background: "#f7f7f7",
    backgroundDark: "#121212",
    minimumDuration: 250,
    ariaLabel: "Loading Acme Studio",
   },
  },
 },
});
```

Create the configured component inside the application's `components` directory. The selected component is resolved statically during the Nuxt build, so unrelated auto-imported components are not added to the client bundle.

`PageFullscreenPreloaderConfiguredContent` is an internal generated wrapper used by the base app for that static import. Do not create or call it yourself; `pageFullscreenPreloader.component` is the only place where the site's own loader-content component is selected.

`playground/myelophone.dev.ts` is only a configuration template and is never loaded by Nuxt directly. Copy it to `playground/myelophone.ts` when testing global configuration in this repository. If `myelophone.ts` does not exist, the internal configuration stays empty and no global full-screen overlay is mounted. The local `/demo` example does not require that file.

Configuration fields:

| Field                          | Values/default                          | Purpose                                                                       |
| ------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------- |
| `component`                    | Auto-imported component name            | Centered global preloader content                                             |
| `props`                        | Serializable object                     | Props passed to the configured content component                              |
| `transparent`                  | `boolean`; default `false`              | Use a transparent overlay instead of its background                           |
| `background`, `backgroundDark` | CSS backgrounds; default `var(--ui-bg)` | Light and dark overlay backgrounds                                            |
| `zIndex`                       | Number or CSS value; default `9999`     | Overlay stacking level                                                        |
| `ariaLabel`                    | `string`; default `Page loading`        | Accessible status label                                                       |
| `class`, `contentClass`        | Class strings                           | Overlay and centered-content customization                                    |
| `minimumDuration`              | Milliseconds; default `250`             | Minimum time the overlay remains visible after hydration or navigation starts |

For a single page, place the component directly in that page. It automatically follows Nuxt's page-loading lifecycle, so it appears while that particular page is loading and disappears on `page:finish`:

```vue
<template>
 <PageFullscreenPreloader background="#f7f7f7" background-dark="#121212">
  <SitePreloaderLogo />
 </PageFullscreenPreloader>
</template>
```

This declaration is local to that page; no manual `ref`, click handler, or global configuration is needed. On the first request the overlay is included next to the main SSR content, but CSS keeps it hidden for `html.nojs`. The existing inline head script changes that class to `js` before Nuxt loads, making the overlay visible without removing or covering the SSR content for no-JavaScript clients and crawlers. On a hard load it stays until `window.load` and `minimumDuration`; on internal navigation it stays until `page:finish` and `minimumDuration`.

Set `transparent` for a transparent full-screen interaction layer. The overlay uses `data-theme="light|dark"`, falls back to `prefers-color-scheme`, disables its fade transition under reduced-motion preferences, and accepts arbitrary slot content.

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
├── components/        UI, grid, view, ready-page, consent, cookie, safe and SEO components
├── composables/       API, i18n, ready-page, storage, device, consent and UI state helpers
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
