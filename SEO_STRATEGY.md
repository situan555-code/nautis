# SEO Foundation Notes

Sunder & Co. uses a static, crawlable site architecture with page-level metadata, canonical URLs, Open Graph tags, sitemap generation, robots policy, and truthful structured data.

## Production Domain

```text
https://www.sunderandco.com
```

## Principles

- Use one canonical production host.
- Keep important service, location, and entity copy in normal HTML.
- Use unique titles and meta descriptions for important pages.
- Avoid unsupported claims, fake proof, fake contact details, fake reviews, and placeholder organization data.
- Keep service pages internally linked through normal crawlable anchors.
- Keep JSON-LD valid and based only on confirmed business information.

## Local Visibility

The site supports Sunder & Co.'s local and regional positioning across New Philadelphia, Dover, Canton, Tuscarawas County, Stark County, and Holmes County, Ohio.

## Validation

Before publishing material SEO changes:

```bash
npm run build
npm run lint
```

Then confirm:

- Canonicals use the production domain.
- Sitemap URLs use the production domain.
- JSON-LD parses cleanly.
- No placeholder phone, address, reviews, ratings, or author data are present.
