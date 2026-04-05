import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const siteData = JSON.parse(readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));

const pages = [
  'index',
  'about',
  'services',
  'case-studies',
  'contact',
  'engagement',
  'insights',
];

// Build rollup input map: { index: '/abs/path/src/index.html', about: '...', ... }
const input = Object.fromEntries(
  pages.map((name) => [name, resolve(__dirname, `src/${name}.html`)]),
);

// Page-specific context for Handlebars
const pageContext = {
  '/index.html': { activePage: 'home', pageTitle: 'Digital Transformation & Revenue Operations' },
  '/about.html': { activePage: 'about', pageTitle: 'About' },
  '/services.html': { activePage: 'services', pageTitle: 'Services' },
  '/case-studies.html': { activePage: 'case-studies', pageTitle: 'Case Studies' },
  '/contact.html': { activePage: 'contact', pageTitle: 'Contact' },
  '/engagement.html': { activePage: 'engagement', pageTitle: 'How We Work' },
  '/insights.html': { activePage: 'insights', pageTitle: 'Insights' },
};

export default defineConfig({
  root: 'src',
  publicDir: '../public',

  plugins: [
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

  server: {
    port: 5173,
    open: true,
  },

  css: {
    devSourcemap: true,
  },
});
