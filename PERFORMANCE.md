# Performance Notes

The site is designed to preserve a premium visual experience while keeping Core Web Vitals in a healthy range.

## Current Priorities

- Keep meaningful headings, service copy, location copy, and calls to action in normal HTML.
- Keep the 3D hero visually stable with a fallback state before WebGL is ready.
- Defer non-critical JavaScript until idle or user interaction where practical.
- Reserve layout space for media and canvas regions to avoid layout shift.
- Keep generated assets compressed and production-ready.

## Build Checks

```bash
npm run build
npm run lint
npm run preview
```

## 3D Asset Pipeline

Raw `.glb` and `.gltf` files can be placed in `src/raw-models/`. The prebuild step writes optimized output to `public/models/`.

If there are no raw models, the pipeline skips cleanly.
