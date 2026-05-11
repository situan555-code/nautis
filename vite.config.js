import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

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

const corePages = {
  'index': { activePage: 'home', pageTitle: 'Digital Transformation & Revenue Operations' },
  'about': { activePage: 'about', pageTitle: 'About' },
  'services-advisory': { activePage: 'services', pageTitle: 'Sunder Advisory' },
  'services-technology': { activePage: 'services', pageTitle: 'Sunder Technology' },
  'services-creative': { activePage: 'services', pageTitle: 'Sunder Creative' },
  'case-studies': { activePage: 'case-studies', pageTitle: 'Case Studies' },
  'contact': { activePage: 'contact', pageTitle: 'Contact' },
  'engagement': { activePage: 'engagement', pageTitle: 'How We Work' },
  'insights': { activePage: 'insights', pageTitle: 'Insights' },
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
  pageContext[`/${slug}.html`] = data;
});

// Insight pages context
validInsightPages.forEach(p => {
  pageContext[`/insights/${p.slug}.html`] = {
    activePage: 'insights',
    category: p.category,
    readTime: p.readTime,
    pageTitle: p.title,
    pageDescription: p.description,
    heroImage: p.heroImage,
    pageSchema: p.pageSchema
  };
});

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://sunder.co',
      outDir: 'dist',
      generateRobotsTxt: true,
      dynamicRoutes: allPageSlugs.map(p => `/${p}.html`),
    }),
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
      helpers: {
        eq: (v1, v2) => v1 === v2,
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
    },
  },
  server: { port: 5173 },
  css: { devSourcemap: true },
});
