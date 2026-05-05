import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

const siteData = JSON.parse(readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));

const insightPages = [
  '3d-visualization-roi',
  'b2b-lead-generation-roi',
  'interactive-kiosk-roi',
  'erp-ecommerce-integration-roi',
  'martech-stack-audit-roi',
  'whale-curve-dealer-rationalization',
  'custom-ai-copilot-roi',
  'leaky-funnel-lost-revenue-audit',
  'automated-competitive-intelligence-roi',
  'b2b-sales-enablement-roi',
  'omnichannel-catalog-syndication-pim',
  'digital-twins-virtual-showrooms-roi'
];

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
  ...insightPages.map(p => `insights/${p}`)
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
  
  // Insight Pages Context
  '/insights/3d-visualization-roi.html': { activePage: 'insights', category: '3D Commerce', readTime: '8 min read', pageTitle: '3D Product Visualization ROI: How Companies Are Cutting Costs by 70% and Boosting Conversions by 94%', pageDescription: 'Discover the real ROI of 3D product visualization vs traditional photography. See how companies are saving up to 70% on production costs, increasing conversions by 94%, and achieving 22x returns with 3D rendering and AR.' },
  '/insights/b2b-lead-generation-roi.html': { activePage: 'insights', category: 'MarTech', readTime: '10 min read', pageTitle: 'B2B Lead Generation ROI 2026: How Automation Delivers $5.44 for Every $1 Spent', pageDescription: 'See the real 2026 ROI of automated lead generation for B2B retailers and wholesalers. Discover how companies are generating 80% more leads, cutting acquisition costs by 60%, and achieving 544% returns.' },
  '/insights/interactive-kiosk-roi.html': { activePage: 'insights', category: 'Creative', readTime: '7 min read', pageTitle: 'Interactive Kiosk ROI 2026: How Next-Gen Kiosks Deliver 28.6% Labor Savings and 22% Sales Lift', pageDescription: 'Discover the real ROI of next-gen interactive kiosks in 2026. See how companies are achieving 28.6% labor cost reduction, 22% sales increases, and +16.3 NPS improvement.' },
  '/insights/erp-ecommerce-integration-roi.html': { activePage: 'insights', category: 'MarTech', readTime: '12 min read', pageTitle: 'ERP to E-Commerce Integration ROI 2026: How Companies Are Saving $420k–$1.2M on Failed Migrations', pageDescription: 'See the real ROI of ERP-to-e-commerce integration in 2026. Learn how successful implementations deliver 3.2x returns, 18–34% revenue growth, and eliminate hundreds of thousands in annual data chaos.' },
  '/insights/martech-stack-audit-roi.html': { activePage: 'insights', category: 'Strategy', readTime: '9 min read', pageTitle: 'MarTech Stack Audit ROI 2026: How Companies Are Saving $240k–$480k Per Year', pageDescription: 'Discover the real ROI of a MarTech stack audit. See how companies are cutting $240k–$480k in annual waste, reducing tools by 42%, and improving marketing ROI by 31% in 2026.' },
  '/insights/whale-curve-dealer-rationalization.html': { activePage: 'insights', category: 'RevOps', readTime: '15 min read', pageTitle: 'Whale Curve Analysis 2026: How Companies Are Recovering $340k–$890k by Cutting Unprofitable Accounts', pageDescription: 'See the real ROI of Whale Curve analysis in 2026. Discover how B2B companies are identifying that 25–45% of accounts destroy profit and recovering hundreds of thousands in the first year.' },
  '/insights/custom-ai-copilot-roi.html': { activePage: 'insights', category: 'AI', readTime: '7 min read', pageTitle: 'Custom AI Copilot ROI 2026: How Companies Are Saving 18–27 Hours Per Employee Per Week', pageDescription: 'See the real ROI of custom AI copilots and internal workflow automation in 2026. Discover how companies are achieving 4.1x returns, saving 18–27 hours per employee weekly.' },
  '/insights/leaky-funnel-lost-revenue-audit.html': { activePage: 'insights', category: 'RevOps', readTime: '10 min read', pageTitle: 'Leaky Funnel Audit 2026: How Companies Are Recovering $1.2M–$4.7M in Lost Revenue', pageDescription: 'See the real ROI of leaky funnel audits in 2026. Discover how B2B companies are recovering 12–29% of lost revenue, improving win rates by up to 34%, and seeing payback in under 5 months.' },
  '/insights/automated-competitive-intelligence-roi.html': { activePage: 'insights', category: 'AI', readTime: '8 min read', pageTitle: 'Automated Competitive Intelligence ROI 2026: How Companies Are Gaining 14–27% Higher Win Rates', pageDescription: 'See the real ROI of automated competitive intelligence tools in 2026. Discover how companies are achieving 3.1x returns, improving win rates by 14–27%, and influencing $1.1M–$3.4M in revenue.' },
  '/insights/b2b-sales-enablement-roi.html': { activePage: 'insights', category: 'Advisory', readTime: '9 min read', pageTitle: 'B2B Sales Enablement ROI 2026: How Top Companies Are Achieving 19–34% Higher Win Rates', pageDescription: 'See the real ROI of B2B sales enablement in 2026. Discover how companies are improving win rates by 19–34%, increasing deal size by up to 27%, and achieving 2.8x returns.' },
  '/insights/omnichannel-catalog-syndication-pim.html': { activePage: 'insights', category: 'MarTech', readTime: '11 min read', pageTitle: 'PIM & Omnichannel Syndication ROI 2026: How Companies Are Cutting Data Errors by 89%', pageDescription: 'See the real ROI of PIM and omnichannel catalog syndication in 2026. Discover how companies are reducing product data errors by up to 89%, increasing sell-through by 29%, and achieving 2.4–4.1x returns.' },
  '/insights/digital-twins-virtual-showrooms-roi.html': { activePage: 'insights', category: '3D Commerce', readTime: '12 min read', pageTitle: 'Digital Twin & Virtual Showroom ROI 2026: How Manufacturers Are Cutting Prototyping Costs by 62%', pageDescription: 'See the real ROI of digital twins and virtual showrooms in 2026. Discover how manufacturers are achieving 3.4x returns, reducing prototyping costs by up to 62%, and saving $1.8M–$5.2M annually.' },
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
