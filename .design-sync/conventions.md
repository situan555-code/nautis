# Sunder & Co. — how to build with this design system

Sunder & Co. is a small Ohio studio: websites, brand systems, local visibility. The voice is plain, confident and short.

## What ships here
- **One React component:** `SunderWordmarkScene`, the 3D glass "Sunder." wordmark hero.
- **The site's real stylesheets:** `design-system.css`, `home.css` and `pages.css` (in `_ds_bundle.css`, imported by `styles.css`), with Outfit and Source Code Pro.
- **Everything else is plain JSX using these CSS classes.** There are no Button or Card React components; write `<a className="btn btn--primary">`.

## Setup and theme
- No provider is needed. The default theme is **dark**: page `#050506`, white text, Outfit.
- Light theme is set on the root element: `document.documentElement.dataset.theme = "light"` (cream `#f6f4ee`, dark text). It can't be scoped to a section.
- **Never use `reveal`, `reveal--delay-*` or `animate-up`.** They start at `opacity: 0`, and the site's scroll script is what reveals them. In a design they stay invisible.
- `.accordion__body` is collapsed (`max-height: 0`) and opened by site JS. Render open items as `accordion__item is-open` with `style={{ maxHeight: "none" }}` on the body.
- Mount the wordmark the way the site does: `<section className="hero"><div className="hero__scene" data-scene-ready="true"><div className="sunder-wordmark-root"><SunderWordmarkScene isVisible /></div></div></section>`.

## Styling vocabulary (real classes — prefer these, then tokens)
| Use | Classes |
|---|---|
| Layout | `container`, `container--sm`, `container--lg`; `section`, `section--flush`; `grid` with `grid--2/3/4/5`; `flex`, `flex-col`, `flex-wrap`, `items-center`, `justify-between`, `justify-center`, `gap-2/4/6/8` |
| Headings | `section-header` (wraps `label` + `h2` + `lead`), `label` (mono eyebrow), `lead`, `text-center`, `text-balance`, `text-muted`, `text-secondary`, `text-accent` |
| Actions | `btn` + `btn--primary` / `btn--secondary` / `btn--ghost`, `btn--lg`; homepage style: `dc-button` + `dc-button--primary` / `dc-button--secondary`, wrapped in `dc-actions` |
| Surfaces | `card`, `stat-card` (`stat-card__value`, `stat-card__label`), `icon-box`, `tag`, `divider`, `highlight-box` |
| Page blocks | `page-hero` (inner-page top), `process-steps` > `process-step` (`__number`, `__title`, `__desc`), `accordion` > `accordion__item` > `accordion__trigger` / `accordion__body` > `accordion__content` |
| Homepage blocks | `dc-intro` (`__content`, `__support`), `dc-services` + `dc-service-grid` + `dc-service-card`, `dc-section-heading`, `dc-final-cta` |

For your own glue, use tokens, not raw values: `var(--color-bg)`, `--color-bg-card`, `--color-border`, `--color-text-primary/secondary/muted`; `--space-1…32`; `--text-xs…5xl`; `--radius-sm/md/lg/xl/full`; `--font-brand`, `--font-mono`; `--max-width`. Read `_ds_bundle.css` for the full token list (the `@layer tokens` block) and each class.

## Example
```jsx
<main>
  <section className="section">
    <div className="container">
      <div className="section-header text-center">
        <span className="label">What we build</span>
        <h2>Websites and brand systems that match the work.</h2>
        <p className="lead">Built in Ohio for local businesses and regional brands.</p>
      </div>
      <div className="grid grid--3" style={{ marginTop: "var(--space-8)" }}>
        <div className="card">
          <h3 style={{ marginBottom: "var(--space-4)" }}>Websites</h3>
          <p style={{ fontSize: "var(--text-sm)" }}>Fast, clear sites that turn visits into calls.</p>
        </div>
        {/* …two more cards */}
      </div>
      <div className="flex justify-center gap-4" style={{ marginTop: "var(--space-8)" }}>
        <a className="btn btn--primary btn--lg" href="/contact.html">Start a Project</a>
        <a className="btn btn--ghost" href="/about.html">About us</a>
      </div>
    </div>
  </section>
</main>
```
