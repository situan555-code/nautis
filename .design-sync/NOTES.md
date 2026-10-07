# design-sync notes — Sunder & Co. (sunderandco.com)

## How this repo syncs
- Source: GitHub situan555-code/nautis → Vercel project `nautis` → www.sunderandco.com. The site is a
  Vite multi-page static site (HTML + Handlebars partials + vanilla JS + CSS). The only React
  component is `src/components/three/SunderWordmarkScene.jsx` (the 3D hero).
- What ships: that component (bundle) + the real stylesheets. `.design-sync/pkg/` is a sync-only
  wrapper package (`sunder-and-co`): `index.js` re-exports the scene; `build.mjs` (cfg.buildCmd, run
  from repo root) concatenates src/css/design-system.css + home.css + pages.css into `pkg/sunder.css`
  (cfg.cssEntry, gitignored). Run buildCmd before package-build.mjs.
- Nav/footer/search/accordion are HTML partials + vanilla JS, NOT React — not importable. The design
  agent rebuilds them in JSX with the site's classes (conventions.md). Turning them into React
  components in the repo is the way to get real cards for them (owner's call).
- `@react-three/fiber` ships its own reconciler and imports `scheduler` directly; the converter's
  react shim rejects that ([SCHEDULER_MISSING]). `pkg/tsconfig.json` (cfg.tsconfig) maps `scheduler`
  to node_modules/scheduler. NO `"//"` comment keys in that tsconfig — the converter strips `//`
  comments before JSON.parse and a `"//"` key breaks the file silently (plugin just doesn't load).
- Group: `srcDir` points at src/components/three so the dir-derived group is empty and the
  `groups/brand.md` stub's `category: Brand` applies.
- Fonts: Outfit (400–900 var) + Source Code Pro (400–700 var), latin, Google Fonts snapshot committed
  in pkg/fonts/ (the site itself loads them from fonts.googleapis.com). pages.css also declares
  Habitus/Aeonik via local() only (one report page) — not shippable, not needed.
- Probe tool: `node .design-sync/tools/probe-card.mjs ds-bundle "<card>?story=<X>" 3000 out.png`.
  Needs `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules` (playwright isn't a repo dep).

## Preview authoring
- The scene must sit in `.hero > .hero__scene[data-scene-ready=true] > .sunder-wordmark-root`
  (sizes the canvas). HDR environment loads from dl.polyhaven.org at runtime (network).
- HomeHero's intro section is below the 900px card viewport; verified with a full-page probe.

## Findings in the site code
- `.reveal` / `.reveal--delay-*` / `.animate-up` start at opacity 0 and need scroll-reveal.js;
  anything rendered outside the site with them is invisible.
- `.cta-banner` is used in markup but has no styles of its own (only `.cta-banner__secondary`).
- `.dc-intro` paints its own cream surface even in dark theme.

## Re-sync risks
- `index.js` exports only SunderWordmarkScene; new React components need adding there.
- The stylesheet list in build.mjs is hard-coded (design-system, home, pages). A new src/css file
  won't ship until it's added.
- Light theme is html-level only (`html[data-theme='light']`).
- Production (www.sunderandco.com) was deployed 2026-09-14; main has later commits — the sync follows
  main, which may be ahead of what's live.
- Toolchain: playwright 1.63.0 in .ds-sync ↔ cached chromium-1243.

## Known render warns
- (none)
