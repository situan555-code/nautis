import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

const SITE_URL = 'https://www.sunderandco.com';
const DEFAULT_DESCRIPTION =
  'Websites, brand systems, local visibility, and follow-up improvements for businesses whose first impression has fallen behind the work they actually do.';

const siteData = JSON.parse(readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const ARTICLE_PUBLISHED_DATE = '2026-06-08';
const ARTICLE_MODIFIED_DATE = '2026-06-08';

const toAbsoluteUrl = (path) => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

function createArticleSchema(article, canonicalUrl) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.description,
    datePublished: ARTICLE_PUBLISHED_DATE,
    dateModified: ARTICLE_MODIFIED_DATE,
    articleSection: article.category,
    publisher: {
      '@id': ORGANIZATION_ID,
      name: 'Sunder & Co.',
    },
  };

  const image = toAbsoluteUrl(article.heroImage);
  if (image) {
    schema.image = image;
  }

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function buildPageSchema({ pagePath, title, description, serviceName, serviceDescription, breadcrumbs }) {
  const pageUrl = `${SITE_URL}${pagePath}`;
  const graph = [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Sunder & Co.',
      url: SITE_URL,
      email: siteData.site.email,
      telephone: siteData.site.phoneSchema,
      areaServed: [
        'United States',
        'New Philadelphia, Ohio',
        'Dover, Ohio',
        'Canton, Ohio',
        'Tuscarawas County, Ohio',
        'Stark County, Ohio',
        'Holmes County, Ohio',
      ],
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      about: {
        '@id': `${pageUrl}#service`,
      },
      provider: {
        '@id': ORGANIZATION_ID,
      },
    },
    {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: serviceName,
      description: serviceDescription,
      provider: {
        '@id': ORGANIZATION_ID,
      },
      areaServed: [
        'United States',
        'Ohio',
      ],
      serviceType: serviceName,
      url: pageUrl,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: `${SITE_URL}${breadcrumb.path}`,
      })),
    },
  ];

  return `<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}
</script>`;
}

function removeAppleDoubleFiles(directory) {
  if (!existsSync(directory)) return;

  readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.name.startsWith('._')) {
      rmSync(entryPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removeAppleDoubleFiles(entryPath);
    }
  });
}

const localServicePageSlugs = [
  'web-design-new-philadelphia-ohio',
  'web-design-canton-ohio',
  'local-seo-new-philadelphia-ohio',
  'branding-design-ohio',
  'photo-video-content-ohio',
  'ai-seo-local-business',
];
const htmlPageSlugs = ['about', 'services-creative', 'contact', 'privacy-policy', ...localServicePageSlugs];
const liveInsightsDataDir = resolve(__dirname, 'src/data/insights');
const liveInsightFiles = existsSync(liveInsightsDataDir)
  ? readdirSync(liveInsightsDataDir).filter(f => f.endsWith('.json') && !f.startsWith('._'))
  : [];
const liveInsightPages = liveInsightFiles.map(file =>
  JSON.parse(readFileSync(resolve(liveInsightsDataDir, file), 'utf-8')),
);
const directoryPageSlugs = [
  'advisory',
  'industries/home-furnishings-ai-visibility',
  'insights',
  ...liveInsightPages.map(page => `insights/${page.slug}`),
];

const corePages = {
  'index': {
    activePage: 'home',
    pageTitle: 'Websites, Brand Systems & Local Visibility',
    pageDescription: DEFAULT_DESCRIPTION,
  },
  'about': {
    activePage: 'about',
    pageTitle: 'About Us',
    pageDescription: 'Learn how Sunder unifies technology, design, brand strategy, custom web development, and AI-powered workflow solutions for connected customer experiences.',
    pagePath: '/about.html',
  },
  'services-creative': {
    activePage: 'services',
    pageTitle: 'Sunder Creative',
    pageDescription: 'Web design, branding, content production, local SEO, and AI search visibility support for Ohio businesses and remote clients across the United States.',
    pagePath: '/services-creative.html',
  },
  'advisory': {
    activePage: 'services',
    inputName: 'advisory/index',
    sourcePath: 'advisory/index.html',
    metaTitle: 'Sunder Advisory | AI Visibility, Brand Strategy & Technical Discoverability',
    pageTitle: 'Sunder Advisory',
    pageDescription: 'Sunder Advisory helps companies improve how they are understood by people, search engines, and AI systems through AI visibility audits, technical discoverability reviews, entity strategy, and brand systems.',
    pagePath: '/advisory/',
    pageSchema: buildPageSchema({
      pagePath: '/advisory/',
      title: 'Sunder Advisory | AI Visibility, Brand Strategy & Technical Discoverability',
      description: 'Sunder Advisory helps companies improve how they are understood by people, search engines, and AI systems through AI visibility audits, technical discoverability reviews, entity strategy, and brand systems.',
      serviceName: 'Sunder Advisory',
      serviceDescription: 'AI visibility audits, technical discoverability reviews, entity strategy, brand systems, and execution planning for companies that need to be understood by people, search engines, and AI systems.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Sunder Advisory', path: '/advisory/' },
      ],
    }),
  },
  'home-furnishings-ai-visibility': {
    activePage: 'services',
    inputName: 'industries/home-furnishings-ai-visibility/index',
    sourcePath: 'industries/home-furnishings-ai-visibility/index.html',
    metaTitle: 'AI Visibility for Home Furnishings Brands & Platforms | Sunder & Co.',
    pageTitle: 'AI Visibility for Home Furnishings Brands & Platforms',
    pageDescription: 'Sunder helps furniture, lighting, décor, bathware, rugs, and home goods companies understand how AI systems see their catalogs, configurators, product data, entity signals, and third-party source-of-truth risks.',
    pagePath: '/industries/home-furnishings-ai-visibility/',
    pageSchema: buildPageSchema({
      pagePath: '/industries/home-furnishings-ai-visibility/',
      title: 'AI Visibility for Home Furnishings Brands & Platforms | Sunder & Co.',
      description: 'Sunder helps furniture, lighting, décor, bathware, rugs, and home goods companies understand how AI systems see their catalogs, configurators, product data, entity signals, and third-party source-of-truth risks.',
      serviceName: 'Home Furnishings AI Visibility Audit',
      serviceDescription: 'AI visibility audits for furniture, lighting, decor, bathware, rugs, and home goods companies with rich catalogs, configurators, product data, entity signals, and third-party source-of-truth risks.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Sunder Advisory', path: '/advisory/' },
        { name: 'Home Furnishings AI Visibility', path: '/industries/home-furnishings-ai-visibility/' },
      ],
    }),
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
  'contact': {
    activePage: 'contact',
    pageTitle: 'Contact',
    pageDescription: 'Contact Sunder & Co. for websites, branding, content, local SEO, follow-up systems, and remote creative support across the United States.',
    pagePath: '/contact.html',
  },
  'privacy-policy': {
    pageTitle: 'Privacy Policy',
    pageDescription: 'Read the Sunder & Co. privacy policy for website analytics, hosting logs, and direct contact by email or phone.',
    pagePath: '/privacy-policy.html',
  },
  'insights': {
    activePage: 'insights',
    inputName: 'insights/index',
    sourcePath: 'insights/index.html',
    pageTitle: 'Insights',
    pageDescription: 'Sunder & Co. notes on AI visibility, brand clarity, search, and the technical details that shape how businesses are understood.',
    pagePath: '/insights/',
  },
};

const liveInsightCorePages = Object.fromEntries(
  liveInsightPages.map((page) => {
    const pagePath = `/insights/${page.slug}/`;
    const canonicalUrl = `${SITE_URL}${pagePath}`;
    return [
      `insights/${page.slug}`,
      {
        activePage: 'insights',
        inputName: `insights/${page.slug}/index`,
        sourcePath: `insights/${page.slug}/index.html`,
        metaTitle: page.metaTitle,
        ogTitle: page.ogTitle,
        ogDescription: page.ogDescription,
        pageTitle: page.title,
        pageDescription: page.description,
        pagePath,
        canonicalUrl,
        category: page.category,
        readTime: page.readTime,
        heroImage: page.heroImage,
        ogType: 'article',
        ogImage: toAbsoluteUrl(page.heroImage),
        pageSchema: createArticleSchema(page, canonicalUrl),
      },
    ];
  }),
);

const pages = {
  ...corePages,
  ...liveInsightCorePages,
};

const allPageSlugs = Object.keys(pages);

// Build rollup input map
const input = Object.fromEntries(
  Object.entries(pages).map(([name, data]) => [
    data.inputName || name,
    resolve(__dirname, `src/${data.sourcePath || `${name}.html`}`),
  ]),
);

// Build page context
const pageContext = {};

// Core pages context
Object.entries(pages).forEach(([slug, data]) => {
  const pagePath = data.pagePath || (slug === 'index' ? '/' : `/${slug}`);
  const sourcePath = data.sourcePath || `${slug}.html`;
  pageContext[`/${sourcePath}`] = {
    ...data,
    pagePath,
    canonicalUrl: `${SITE_URL}${pagePath}`,
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

        if (!existsSync(sitemapPath)) {
          removeAppleDoubleFiles(resolve(__dirname, 'dist'));
          return;
        }

        let sitemap = readFileSync(sitemapPath, 'utf-8');
        for (let attempt = 0; attempt < 50 && !sitemap.includes(`${SITE_URL}/ai-seo-local-business`); attempt += 1) {
          await new Promise(resolveAttempt => setTimeout(resolveAttempt, 100));
          sitemap = readFileSync(sitemapPath, 'utf-8');
        }

        htmlPageSlugs.forEach((slug) => {
          sitemap = sitemap.replace(
            new RegExp(`<loc>${SITE_URL}/${slug}</loc>`, 'g'),
            `<loc>${SITE_URL}/${slug}.html</loc>`,
          );
        });
        directoryPageSlugs.forEach((slug) => {
          sitemap = sitemap
            .replace(new RegExp(`<loc>${SITE_URL}/${slug}</loc>`, 'g'), `<loc>${SITE_URL}/${slug}/</loc>`)
            .replace(new RegExp(`<loc>${SITE_URL}/${slug}/index</loc>`, 'g'), `<loc>${SITE_URL}/${slug}/</loc>`)
            .replace(new RegExp(`<loc>${SITE_URL}/${slug}/index.html</loc>`, 'g'), `<loc>${SITE_URL}/${slug}/</loc>`);
        });
        writeFileSync(sitemapPath, sitemap);
        removeAppleDoubleFiles(resolve(__dirname, 'dist'));
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
