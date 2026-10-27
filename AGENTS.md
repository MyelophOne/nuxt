# @myelophone/nuxt — package development

This repository develops the reusable Nuxt 4 layer/framework, not a customer website. Preserve public contracts and existing consumer applications. Site generation, art direction, palettes, page-depth defaults and layout profiles belong to `@myelophone/nuxt-template` and its local `docs/creative-direction/`. Do not impose a marketing-site workflow on package maintenance.

## 1. Establish scope and ownership

- Read `git status`, `package.json`, `nuxt.config.ts`, relevant README sections and actual source before editing. Preserve unrelated user changes. Search narrowly with `rg`/`rg --files`.
- Reproduce the reported behavior and locate its owner: component, composable/store, registration, configuration, server plugin or build transform. Verify installed versions and generated registrations; documentation examples alone do not establish a working API.
- Implement the smallest coherent fix in the original owner. Do not recreate, copy, vendor, shadow or bypass existing components/subsystems, introduce parallel providers, or accumulate CSS/DOM workarounds. Extend supported props/slots/classes/variables compatibly when appropriate.
- Keep package fixes distinct from application presentation. A consumer's visual preference is not evidence of a framework defect. Do not redesign unrelated components or inject customer branding, palettes, copy, assets or layout quotas into layer defaults.
- Consumers explicitly read their installed package's AGENTS.md for technical contracts; dependency instructions are not automatically inherited. A sibling checkout is not proof of a consumer's installed API. Do not edit installed dependencies to synchronize them.

## 2. Source map and public compatibility

- Runtime application source: `app/`; configuration: `nuxt.config.ts`; public configuration types: `app/types/myelophone.d.ts` and relevant typed APIs; build helpers/transforms: `vite/plugins/` and registered server plugins. Follow actual imports/registration rather than assuming an entry point.
- `serverDir` is configured as `app/server`. Respect server/build/client boundaries. Never bundle Node-only modules, private runtime config or build-only utilities into the client.
- Demos live in `playground/`; Nuxt 4 demo routes belong in `playground/app/pages/` unless resolved configuration says otherwise. Contract/browser tests live in `tests/`. Production sites belong in the consumer template.
- Preserve names, auto-import prefixes, defaults, prop types, emits, slots, fallthrough attributes, configuration merge behavior and route/locale conventions. Check downstream use before changing behavior. Explain an unavoidable breaking change; never silently rename or remove an API.
- A new or changed public contract updates its source/types, relevant README documentation, a focused playground example and meaningful regression tests. Generated declarations are evidence, not files to edit. Preserve license/copyright notices.
- Keep changes to package metadata, dependency versions, lockfiles and releases intentional and within the request. Do not publish/deploy, upgrade tooling or rewrite configuration merely to silence a failure.

## 3. Auto-imports and framework conventions

- No manual runtime imports where auto-imports are supported in that execution context: Vue/Nuxt APIs, registered layer composables, utilities, stores, constants and components. Do not import from `vue`, `#app`, `#imports`, `#components` or source paths merely for explicitness.
- Verify `.nuxt/imports.d.ts`, `.nuxt/components.d.ts`, configured scanning, registrations and name collisions; run the existing prepare workflow when needed. Fix registration/export problems rather than adding imports or disabling scanning.
- External unregistered APIs, assets/styles, build modules and standalone tests/scripts may need imports. Use `import type` for types unavailable through generated declarations. App auto-imports do not imply availability in Nitro, workers, config or tests.
- Use typed Vue SFCs with `<script setup lang="ts">`, Composition API, stable keys and explicit contracts. Follow existing formatting and installed Nuxt behavior; no Nuxt 2 patterns, custom router or duplicate route registration.

## 4. SSR and hydration are release-blocking contracts

- **Package changes must introduce no SSR errors, hydration mismatches or hydration warnings.** This applies to default configuration and affected supported optional features, in development, production SSR and static generation. Do not deliver a change with a known SSR/hydration regression; identify pre-existing unrelated failures separately.
- Server HTML and the first client render must agree in text, markup, attributes and stable IDs. Check invalid nesting/browser HTML repair, locale, theme, async state and server HTML transforms. Use `useId` where suitable; do not render viewport, localStorage, random or current-time-dependent differences during hydration.
- Browser globals/DOM access and browser-only integrations belong behind real lifecycle/execution boundaries, with cleanup and useful fallbacks. No blanket `ClientOnly`, `ssr: false`, mismatch suppression, timeouts, forced remounts or disabled HTML processing to hide a defect. A genuinely browser-only widget may use a bounded accessible fallback.
- Inspect **development browser console warnings and errors, uncaught exceptions, server logs and hydration completion**, then verify production SSR and generated output. Production may omit hydration diagnostics. A successful build, HTTP 200 or error-only console check does not prove SSR correctness.
- Use SSR-safe `useFetch` or `useAsyncData` around the existing service/API contract. Create context-dependent clients in setup before handlers. Avoid duplicate initial requests; mutations belong to user actions. Keep handlers side-effect-free and return defined data; keys reflect route/query/locale/resource dimensions and shared-key options agree.
- Nuxt 4 async data is shallow by default: replace values or explicitly justify deep reactivity. Limit payloads, fetch independent resources concurrently and avoid serializing credentials, functions or arbitrary instances.
- Local UI uses local refs; small serializable shared SSR state uses `useState`; existing Pinia stores own their domains. No request-shared mutable user state at module scope. Use `callOnce` for suitable store initialization. Browser persistence is not authorization.
- Call context-dependent composables only in supported contexts. Clean up listeners, observers, timers, subscriptions and object URLs; cancel obsolete requests where supported. Avoid deep watchers, duplicate derived state and render-time DOM measurements.

## 5. Component and subsystem contracts

- Preserve the inherited `app/app.vue` shell: skip link, route announcer, main landmark, initialization, error boundaries and global UI. No duplicate main, consent, toasts, search, command palette, preloaders or theme providers. Consumer extension points must compose rather than require copying the shell.
- Grid components own page layout and responsive/background contracts. Verify actual tags, spans, gutters, breakpoint behavior, stacking, media and sticky bounds. Dynamic semantic roots use `<component :is="as">`; `:is` on a literal div does not implement this API. Do not solve grid defects with a second grid or document-wide overflow hiding.
- Verify real attribute/event forwarding to interactive roots and inputs, semantic tags, keyboard/focus behavior, disabled/loading states and accessible names. Preserve button/link distinctions; `UiButton` does not infer its root from `href`/`to`.
- Shared base CSS must preserve inline size/line-height inheritance unless deliberately styled. Check nested heading/button/wordmark text and Tailwind cascade interactions; no per-consumer compensation for a broken reset.
- Keep SVG `UiIcon`/currentColor, `UiThemeToggle`/settings state and `SafeEmail` as single owning implementations. Preserve theme SSR agreement, persistence/cross-tab behavior, public-email protection and accessible fallback contracts. Do not introduce equivalent providers or duplicate primitives.
- Preserve `multi18n`, `useMultiLang`, unprefixed default-locale URLs and production translation tree shaking. Literal `t`/`tn` keys or documented safelists are required; `useSafeList` stays build/server-only. Verify locale changes, missing-key fallback and retained production strings.
- Ready-page APIs (`useReadyPage`, `PageReadyLocalized`, `mergeReadyContent`, `readyCssVariables`) own content fallback, merging and SEO. Preserve complete locale defaults and documented array semantics; do not confuse them with consumer configuration merging.
- Preserve `useApi`, existing stores, SEO/structured-data contracts, consent and CSP boundaries. Do not add duplicate HTTP/state/i18n/theme/UI/animation stacks. New dependencies require a demonstrated gap and bundle/runtime compatibility assessment.

## 6. Build, security and performance

- Preserve both production SSR and static-generation support. Understand `NUXT_STATIC`, `NUXT_PLAYGROUND`, deployment presets and effective config before changing build behavior. Do not enable experimental features, streaming, manual chunking or optimizers without an evidenced requirement.
- Changes to transforms, minification, CSS cleanup, auto-registration or locale tree shaking need positive and negative cases: preserve valid markup/styles/translations, remove only intended content, and verify final production artifacts. Inspect interactions between server HTML transforms and Vue hydration.
- Keep the existing Tailwind v4 pipeline. No second Tailwind entry, v3 config, CDN CSS, speculative polyfills or service worker. Use statically discoverable classes or validated variables. The pipeline strips `!important`; do not use it to repair cascade defects.
- Retain image/font optimization, intrinsic media dimensions, no-JS readability, reduced-motion and device/network fallbacks. UI changes must remain responsive and keyboard-accessible in both themes. Avoid layout shift, repaint-heavy motion, `transition-all` and permanent `will-change`.
- Preserve private/public runtime-config separation, server authorization/validation and safe credential forwarding. Never leak secrets into payloads, cache personalized data globally, or load consent-gated integrations early. Keep CSP and consent enabled during verification.

## 7. Verification and reporting

- Use the pinned Yarn/Node requirements, existing lockfile and actual scripts. Currently `yarn dev`, `yarn build`, `yarn generate` target **playground** with `NUXT_PLAYGROUND=true`; `yarn server` serves `playground/.output/server/index.mjs`. Re-read scripts before executing; this differs from consumer application commands.
- Scripts use POSIX environment assignments. On native PowerShell set equivalent variables explicitly and invoke the local Nuxt CLI for the correct target; preserve `NODE_OPTIONS` and all mode flags. Do not carry `NUXT_STATIC=true` into SSR validation or consumer-only `PROD_DIST` settings into unrelated package checks.
- Run applicable `yarn test:types`, scoped Biome and focused regression tests. `biome:check` writes fixes in app/playground: keep scope and review the diff. Inspect `playwright.config.ts`: its web server runs `yarn build && yarn server` on port 3000; ensure a reused server actually matches the tested revision/mode.
- Runtime/configuration/build changes require **both `yarn build` and `yarn generate`**, browser checks of the built SSR server, and a separate file-only server for generated `playground/.output/public`. Preserve SSR artifacts before generation when needed. Verify affected routes directly and through client navigation, reload, back/forward and locale/theme changes. Add dev-console checks for hydration-sensitive work.
- For component UI changes, inspect actual SSR HTML and the hydrated DOM, computed inheritance, relevant interactions and readable narrow/wide screenshots. Check small widths, long labels/locales, zoom, focus, touch/reduced motion as relevant. Playground fixtures should demonstrate the contract, not become a customer landing page.
- Regression tests must exercise observable behavior and the original failure, not merely mirror implementation. Do not broaden/repeat checks without a reason after scoped requirements pass. Documentation-only changes need link/content checks, not a runtime rebuild.
- If a tool fails before checking application code (for example incompatible TypeScript/vue-tsc exports), report exact versions/error and mark the check blocked. Do not patch `node_modules`, disable checks, silently upgrade dependencies or claim success. Report unverified browser/mode coverage explicitly.
- Review the diff for compatibility, duplicate APIs, manual auto-importable imports, generated artifacts, unrelated changes and security/performance regressions. Never edit dependencies, generated declarations, `.nuxt/`, `.output/`, caches or lockfiles by hand.
- Report the owning fix, affected contracts, checks actually performed and remaining limitations. Never equate compilation with runtime/SSR correctness.

Consult relevant official Nuxt 4 documentation when uncertain: [auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports), [data fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching), [state](https://nuxt.com/docs/4.x/getting-started/state-management), [hydration](https://nuxt.com/docs/4.x/guide/best-practices/hydration). This package's source establishes its extensions.
