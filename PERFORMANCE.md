# Performance Optimization Guide — Sunder & Co.

**Goal**: Keep Core Web Vitals in the "Good" range (LCP < 2.5s, INP < 200ms, CLS < 0.1) even with 35+ insight pages and Three.js content.

---

## Core Principles

1. **Lazy Load Everything Non-Critical**
   - All images below the fold: `loading="lazy"` + `decoding="async"`
   - Three.js scenes: only initialize when the container enters viewport
   - Calculators & heavy JS: defer until idle or user interaction

2. **Prioritize Above-the-Fold**
   - Hero images: `fetchpriority="high"` + preload in `<head>`
   - Critical CSS inlined where possible
   - Non-critical JS deferred

3. **Image Strategy**
   - Use AVIF + WebP fallbacks (already in place)
   - Run Python asset scripts (`process_all_icons.py`, `crop_icons.py`) before major content pushes
   - Target: hero images < 150KB, content images < 80KB

4. **JavaScript Budget**
   - Keep main bundle < 150KB gzipped
   - Calculators.js is the heaviest module — only load on pages that need it
   - Use dynamic `import()` for future heavy features

---

## Current Optimizations (May 2026)

- `main.js` now defers `search`, `filters`, and `calculators` using `requestIdleCallback`
- ScrollReveal and Counters use IntersectionObserver (good)
- All calculators are CSP-compliant and run client-side only

---

## Next Wins (Flash Agent Tasks)

### 1. Add lazy loading to all insight pages
Run this prompt on every insight HTML file:

```
Add `loading="lazy"` and `decoding="async"` to every <img> tag that is not the hero image.
Add `fetchpriority="high"` only to the main hero image.
Do not change any other attributes.
```

### 2. Defer Three.js initialization
For any page using Three.js (e.g. case studies or 3D commerce pages):
- Wrap the Three.js scene initialization in an IntersectionObserver
- Only start rendering when the container is ~30% in viewport

### 3. Add resource hints (optional but recommended)
In `src/partials/head.html` or equivalent, add:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
```

---

## Verification
After changes:
```bash
npm run build
npm run preview
```
Then test with:
- Chrome DevTools > Lighthouse (Performance score ≥ 90)
- WebPageTest.org (filmstrip + Core Web Vitals)

**Last updated**: May 8, 2026
