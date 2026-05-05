import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

const siteData = JSON.parse(readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));

const pages = [
  'index',
  'about',
  'services-advisory',
  'services-technology',
  'services-creative',
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
  '/index.html': { activePage: 'home', pageTitle: 'Digital Transformation & Revenue Operations', pageDescription: 'Sunder & Co. provides executive-level digital transformation, MarTech consulting, and 3D commerce for industrial and B2B brands.' },
  '/about.html': { activePage: 'about', pageTitle: 'About', pageDescription: 'Learn about Sunder & Co., our approach to fractional Chief Digital Officer services, and our track record in digital strategy.' },
  '/services-advisory.html': { activePage: 'services', pageTitle: 'Sunder Advisory', pageDescription: 'Sunder Advisory offers MarTech infrastructure, CRM deployment, ERP integrations, digital advertising (PPC), SMS marketing, and revenue operations.' },
  '/services-technology.html': { activePage: 'services', pageTitle: 'Sunder Technology', pageDescription: 'Sunder Technology provides Managed IT, Cybersecurity (vCISO, SOC 2, HIPAA), and AI Implementation for manufacturers, construction, and clinics.' },
  '/services-creative.html': { activePage: 'services', pageTitle: 'Sunder Creative', pageDescription: 'Sunder Creative provides premium web design, local SEO, 3D WebGL configurators, and brand identity for legacy and industrial brands.' },
  '/case-studies.html': { activePage: 'case-studies', pageTitle: 'Case Studies', pageDescription: 'Explore our case studies featuring high-impact digital turnarounds, 3D configurators, and MarTech integrations.' },
  '/contact.html': { activePage: 'contact', pageTitle: 'Contact', pageDescription: 'Contact Sunder & Co. for an audit of your revenue architecture and digital systems.' },
  '/engagement.html': { activePage: 'engagement', pageTitle: 'How We Work', pageDescription: 'Understand our consulting and engagement models, from fractional CMO services to full-scale enterprise transformation.' },
  '/insights.html': { activePage: 'insights', pageTitle: 'Insights', pageDescription: 'Read the latest insights on MarTech, B2B digital strategy, applied AI, and headless commerce.' },
};

export default defineConfig({
  root: 'src',
  publicDir: '../public',

  plugins: [
    react(),
    Sitemap({
      hostname: 'https://sunder.co', // Adjust domain as needed
      outDir: 'dist',
      generateRobotsTxt: true,
      dynamicRoutes: pages.map(p => `/${p}.html`),
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

  server: {
    port: 5173,
  },

  css: {
    devSourcemap: true,
  },
});
