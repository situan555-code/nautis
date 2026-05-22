# Sunder & Co. Website

Public website for Sunder & Co., a local and regional creative agency serving New Philadelphia, Dover, Canton, Tuscarawas County, Stark County, and Holmes County, Ohio.

The site is built with Vite, Handlebars, React, and Three.js. It includes static service pages, insight articles, shared partials, search/filter behavior, and a 3D Sunder wordmark hero.

## Quick Start

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Optimize assets and build the production site to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint against source JavaScript |
| `npm run format` | Format source HTML, CSS, JS, and JSON files |

## Project Structure

```text
src/
  components/three/     React Three Fiber scene files
  css/                  Design system and page styles
  data/                 Site data and page metadata
  insights/             Static insight article pages
  js/                   Shared browser behavior
  partials/             Shared Handlebars partials
public/
  data/                 Public search/site data
  models/               Optimized 3D model output
scripts/
  optimize-models.js    GLB/glTF optimization pipeline
```

## SEO Foundation

The production domain is:

```text
https://www.sunderandco.com
```

Page metadata, canonicals, Open Graph URLs, sitemap output, and JSON-LD are generated from the Vite/Handlebars build configuration and shared site data.

## 3D Hero

The homepage uses a React Three Fiber hero scene with a normal HTML fallback. The fallback remains visible while the WebGL scene loads and on devices where the 3D scene is intentionally disabled.

## Build Notes

The prebuild step runs `scripts/optimize-models.js`. If `src/raw-models/` is empty, the model pipeline exits cleanly and the normal Vite build continues.

## Contact

- Email: hello@sunderandco.com
- Site: https://www.sunderandco.com
