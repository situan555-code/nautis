import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

const SITE_URL = 'https://www.sunderandco.com';
const DEFAULT_DESCRIPTION =
  'Sunder & Co. builds websites, branding systems, local SEO foundations, content, and AI search visibility systems for small and mid-sized businesses in New Philadelphia, Dover, Canton, Tuscarawas County, Stark County, and Holmes County, Ohio.';

const siteData = JSON.parse(readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));

// Dynamic Insight Pages
const pagesDataDir = resolve(__dirname, 'src/data/pages');
const insightFiles = readdirSync(pagesDataDir).filter(f => f.endsWith('.json') && !f.startsWith('._'));
const insightPagesData = insightFiles.map(f => JSON.parse(readFileSync(resolve(pagesDataDir, f), 'utf-8')));

// Only include insight pages that have a corresponding HTML file in src/insights/
const validInsightPages = insightPagesData.filter(p => {
  try {
    return readFileSync(resolve(__dirname, `src/insights/${p.slug}.html`));
  } catch (e) {
    console.warn(`⚠️ Warning: Insight page data found for "${p.slug}" but src/insights/${p.slug}.html is missing. Skipping from build.`);
    return false;
  }
});

const insightSlugs = validInsightPages.map(p => p.slug);

const toAbsoluteUrl = (path) => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const createArticleSchema = (page, canonicalUrl) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: page.title,
    description: page.description,
    image: toAbsoluteUrl(page.heroImage),
    datePublished: '2026-05-01',
    dateModified: '2026-05-22',
    articleSection: page.category,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
};

const noindexInsightSlugs = [
  '3d-motion-commerce-roi-2026',
  '3d-visualization-roi',
  'ai-search-moat-beyond-sge',
  'ai-search-traffic-2026-citation-strategy',
  'b2b-lead-generation-roi',
  'brand-consistency-roi-2026',
  'branding-consistency-revenue-leak-2026',
  'gbp-41-percent-actions-growth-2026',
  'interactive-kiosk-roi',
  'local-seo-roi-backyard-dominance-2026',
  'real-photography-roi-2026',
  'shadow-ai-risk-2026',
  'video-landing-page-conversion-2026',
  'whale-curve-profitability-analysis',
];

const localServicePageSlugs = [
  'web-design-new-philadelphia-ohio',
  'web-design-canton-ohio',
  'local-seo-new-philadelphia-ohio',
  'branding-design-ohio',
  'photo-video-content-ohio',
  'ai-seo-local-business',
];

const corePages = {
  'index': {
    activePage: 'home',
    pageTitle: 'Websites, Branding, Local SEO & AI Search Visibility',
    pageDescription: DEFAULT_DESCRIPTION,
  },
  'about': {
    activePage: 'about',
    pageTitle: 'About',
    pageDescription: 'Learn about Sunder & Co., a creative and digital partner for small and mid-sized businesses in eastern Ohio.',
  },
  'services-advisory': {
    activePage: 'services',
    pageTitle: 'Sunder Advisory',
    pageDescription: 'Sunder Advisory supports business operations, digital strategy, and practical systems planning for growing organizations.',
  },
  'services-technology': {
    activePage: 'services',
    pageTitle: 'Sunder Technology',
    pageDescription: 'Sunder Technology supports practical IT, security, and technology foundations for local and regional businesses.',
  },
  'services-creative': {
    activePage: 'services',
    pageTitle: 'Sunder Creative',
    pageDescription: 'Web design, branding, content production, local SEO, and AI search visibility support for small and mid-sized businesses in eastern Ohio.',
  },
  'web-design-new-philadelphia-ohio': {
    activePage: 'services',
    pageTitle: 'Web Design for New Philadelphia, Ohio Businesses',
    pageDescription: 'Web design for New Philadelphia, Dover, and Tuscarawas County businesses that need clearer messaging, stronger local visibility, and a website built to convert real inquiries.',
    pagePath: '/web-design-new-philadelphia-ohio.html',
  },
  'web-design-canton-ohio': {
    activePage: 'services',
    pageTitle: 'Web Design for Canton, Ohio Businesses',
    pageDescription: 'Website design for Canton and Stark County businesses that need a modern, credible, search-ready site built around clarity, trust, and lead generation.',
    pagePath: '/web-design-canton-ohio.html',
  },
  'local-seo-new-philadelphia-ohio': {
    activePage: 'services',
    pageTitle: 'Local SEO for New Philadelphia and Dover Businesses',
    pageDescription: 'Local SEO services for New Philadelphia, Dover, and Tuscarawas County businesses that want cleaner search visibility, stronger service pages, and a more consistent local presence.',
    pagePath: '/local-seo-new-philadelphia-ohio.html',
  },
  'branding-design-ohio': {
    activePage: 'services',
    pageTitle: 'Branding and Design for Ohio Businesses',
    pageDescription: 'Branding and design services for Ohio businesses that need clearer visuals, stronger first impressions, and a consistent identity across web, print, and customer touchpoints.',
    pagePath: '/branding-design-ohio.html',
  },
  'photo-video-content-ohio': {
    activePage: 'services',
    pageTitle: 'Photo, Video, and Content Production for Ohio Businesses',
    pageDescription: 'Photo, video, and content production for Ohio businesses that need authentic visuals, stronger website content, and media that helps customers understand and trust the business.',
    pagePath: '/photo-video-content-ohio.html',
  },
  'ai-seo-local-business': {
    activePage: 'services',
    pageTitle: 'AI SEO for Local Businesses',
    pageDescription: 'AI SEO services for local businesses that want clearer search visibility across Google, maps, and AI-powered discovery systems.',
    pagePath: '/ai-seo-local-business.html',
  },
  'case-studies': {
    activePage: 'case-studies',
    pageTitle: 'Case Studies',
    pageDescription: 'Selected Sunder & Co. work, prototypes, and examples across web, design, content, and digital systems.',
  },
  'contact': {
    activePage: 'contact',
    pageTitle: 'Contact',
    pageDescription: 'Start a project with Sunder & Co. for websites, branding, content, local SEO, and follow-up systems.',
  },
  'engagement': {
    activePage: 'engagement',
    pageTitle: 'How We Work',
    pageDescription: 'How Sunder & Co. reviews, builds, and supports customer-facing digital systems for growing businesses.',
  },
  'insights': {
    activePage: 'insights',
    pageTitle: 'Insights',
    pageDescription: 'Sunder & Co. insights on websites, branding, content, local visibility, search, and digital systems.',
  },
};

const allPageSlugs = [
  ...Object.keys(corePages),
  ...insightSlugs.map(s => `insights/${s}`)
];

// Build rollup input map
const input = Object.fromEntries(
  allPageSlugs.map((name) => [name, resolve(__dirname, `src/${name}.html`)]),
);

// Build page context
const pageContext = {};

// Core pages context
Object.entries(corePages).forEach(([slug, data]) => {
  const pagePath = data.pagePath || (slug === 'index' ? '/' : `/${slug}`);
  pageContext[`/${slug}.html`] = {
    ...data,
    pagePath,
    canonicalUrl: `${SITE_URL}${pagePath}`,
  };
});

// Insight pages context
validInsightPages.forEach(p => {
  const pagePath = `/insights/${p.slug}`;
  const canonicalUrl = `${SITE_URL}${pagePath}`;
  pageContext[`/insights/${p.slug}.html`] = {
    activePage: 'insights',
    category: p.category,
    readTime: p.readTime,
    pageTitle: p.title,
    pageDescription: p.description,
    pagePath,
    canonicalUrl,
    heroImage: p.heroImage,
    ogType: 'article',
    noindex: noindexInsightSlugs.includes(p.slug),
    pageSchema: createArticleSchema(p, canonicalUrl),
  };
});

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [
    react(),
    Sitemap({
      hostname: SITE_URL,
      outDir: 'dist',
      generateRobotsTxt: false,
    }),
    {
      name: 'sunder-html-service-sitemap-urls',
      async closeBundle() {
        const sitemapPath = resolve(__dirname, 'dist/sitemap.xml');
        for (let attempt = 0; attempt < 50; attempt += 1) {
          if (existsSync(sitemapPath)) break;
          await new Promise(resolveAttempt => setTimeout(resolveAttempt, 100));
        }

        if (!existsSync(sitemapPath)) return;

        let sitemap = readFileSync(sitemapPath, 'utf-8');
        for (let attempt = 0; attempt < 50 && !sitemap.includes(`${SITE_URL}/ai-seo-local-business`); attempt += 1) {
          await new Promise(resolveAttempt => setTimeout(resolveAttempt, 100));
          sitemap = readFileSync(sitemapPath, 'utf-8');
        }

        localServicePageSlugs.forEach((slug) => {
          sitemap = sitemap.replace(
            new RegExp(`<loc>${SITE_URL}/${slug}</loc>`, 'g'),
            `<loc>${SITE_URL}/${slug}.html</loc>`,
          );
        });
        noindexInsightSlugs.forEach((slug) => {
          sitemap = sitemap.replace(
            new RegExp(`\\s*<url>\\s*<loc>${SITE_URL}/insights/${slug}</loc>[\\s\\S]*?<\\/url>`, 'g'),
            '',
          );
        });
        writeFileSync(sitemapPath, sitemap);
      },
    },
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
      helpers: {
        eq: (v1, v2) => v1 === v2,
        json: value => JSON.stringify(value || ''),
      },
      context(pagePath) {
        return {
          ...siteData,
          ...(pageContext[pagePath] || {}),
        };
      },
    }),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input,
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
          if (id.includes('@react-three/fiber')) return 'vendor-r3f';
          if (id.includes('@react-three/drei')) return 'vendor-drei';
          if (id.includes('three-stdlib')) return 'vendor-three-stdlib';
          if (id.includes('/three/')) return 'vendor-three';
          return undefined;
        },
      },
    },
  },
  server: { port: 5173 },
  css: { devSourcemap: true },
});
