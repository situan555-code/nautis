import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

const siteData = JSON.parse(readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));

const insightPages = [
  'shadow-ai-risk-2026',
  'ai-search-moat-beyond-sge',
  'post-roi-governance-2026',
  'zero-party-data-growth-2026',
  'quantum-safe-branding-trust',
  'generative-video-creative-scale',
  'agentic-workflows-productivity-2026',
  'cognitive-load-design-strategy',
  'programmatic-seo-2-0-growth',
  'hyper-personalization-ux-creative',
  'decentralized-id-security-2026',
  'small-language-models-slm-enterprise',
  'resilient-supply-chain-data-strategy',
  'community-led-growth-2026',
  'immersive-commerce-3d-ux-creative',
  'ethical-ai-auditing-cybersecurity',
  'multimodal-search-optimization-ai',
  'headless-everything-architecture-2026',
  'retention-loops-ai-growth-2026',
  'emotional-design-logic-creative',
  'data-sovereignty-compliance-2026',
  'custom-gpt-enterprise-moat-ai',
  'circular-economy-data-strategy',
  'cro-3-0-ai-growth',
  'dynamic-creative-optimization-creative',
  'm-and-a-tech-due-diligence-strategy',
  'martech-stack-audit-roi',
  'whale-curve-dealer-rationalization',
  'b2b-sales-enablement-roi',
  'omnichannel-catalog-syndication-pim',
  'digital-twins-virtual-showrooms-roi',
  'automated-competitive-intelligence-roi',
  'b2b-lead-generation-roi',
  'interactive-kiosk-roi',
  'erp-ecommerce-integration-roi'
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
  '/index.html': { activePage: 'home', pageTitle: 'Digital Transformation & Revenue Operations' },
  '/about.html': { activePage: 'about', pageTitle: 'About' },
  '/services-advisory.html': { activePage: 'services', pageTitle: 'Sunder Advisory' },
  '/services-technology.html': { activePage: 'services', pageTitle: 'Sunder Technology' },
  '/services-creative.html': { activePage: 'services', pageTitle: 'Sunder Creative' },
  '/case-studies.html': { activePage: 'case-studies', pageTitle: 'Case Studies' },
  '/contact.html': { activePage: 'contact', pageTitle: 'Contact' },
  '/engagement.html': { activePage: 'engagement', pageTitle: 'How We Work' },
  '/insights.html': { activePage: 'insights', pageTitle: 'Insights' },
  
  // Insight Pages Context
  '/insights/ai-search-moat-beyond-sge.html': { 
    activePage: "insights", 

    category: "AI & GEO", 

    readTime: "12 min read", 

    pageTitle: "Building an AI Search Moat: Beyond SGE", 

    pageDescription: "Traditional SEO is dying. GEO (Generative Engine Optimization) is the new frontier. How to win in the era of Perplexity and Gemini.",

    heroImage: '/hero/ai-search-moat-beyond-sge.avif'
  },
  '/insights/post-roi-governance-2026.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "10 min read", 

    pageTitle: "Post-ROI Governance: The 2026 Efficiency Paradox", 

    pageDescription: "Why chasing pure ROI is leading to strategic stagnation. The shift toward long-term governance and cognitive agility.",

    heroImage: '/hero/post-roi-governance-2026.avif'
  },
  '/insights/zero-party-data-growth-2026.html': { 
    activePage: "insights", 

    category: "SEO & Growth", 

    readTime: "14 min read", 

    pageTitle: "Zero-Party Data: The Growth Engine of 2026", 

    pageDescription: "Cookies are gone. Logic is king. How to build growth loops using data your customers actually want to give you.",

    heroImage: '/hero/zero-party-data-growth-2026.avif'
  },
  '/insights/quantum-safe-branding-trust.html': { 
    activePage: "insights", 

    category: "Cybersecurity", 

    readTime: "9 min read", 

    pageTitle: "Quantum-Safe Branding: A New Trust Signal", 

    pageDescription: "Security is now a brand asset. Why quantum-safe encryption is the premium trust signal for high-net-worth audiences.",

    heroImage: '/hero/quantum-safe-branding-trust.avif'
  },
  '/insights/generative-video-creative-scale.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "11 min read", 

    pageTitle: "Generative Video: Scaling the Unscalable", 

    pageDescription: "How Sora and Runway are changing creative production. Move from static campaigns to dynamic, per-user video experiences.",

    heroImage: '/hero/generative-video-creative-scale.avif'
  },
  '/insights/agentic-workflows-productivity-2026.html': { 
    activePage: "insights", 

    category: "AI & GEO", 

    readTime: "13 min read", 

    pageTitle: "Agentic Workflows: The Death of the SaaS Dashboard", 

    pageDescription: "Stop clicking buttons. Start managing agents. Why the future of enterprise software is invisible and autonomous.",

    heroImage: '/hero/agentic-workflows-productivity-2026.avif'
  },
  '/insights/cognitive-load-design-strategy.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "8 min read", 

    pageTitle: "Cognitive Load Design: The New UX Frontier", 

    pageDescription: "Information is cheap, attention is expensive. Designing interfaces that respect the user's mental bandwidth.",

    heroImage: '/hero/cognitive-load-design-strategy.avif'
  },
  '/insights/programmatic-seo-2-0-growth.html': { 
    activePage: "insights", 

    category: "SEO & Growth", 

    readTime: "12 min read", 

    pageTitle: "Programmatic SEO 2.0: Quality Over Quantity", 

    pageDescription: "How to use AI to generate 10,000 high-value pages without triggering the 'Spam' flag. Content that actually converts.",

    heroImage: '/hero/programmatic-seo-2-0-growth.avif'
  },
  '/insights/hyper-personalization-ux-creative.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "10 min read", 

    pageTitle: "Hyper-Personalization: Beyond \"Hello [First_Name]\"", 

    pageDescription: "Using real-time behavioral signals to morph your entire site layout for each visitor. The ultimate conversion hack.",

    heroImage: '/hero/hyper-personalization-ux-creative.avif'
  },
  '/insights/decentralized-id-security-2026.html': { 
    activePage: "insights", 

    category: "Cybersecurity", 

    readTime: "14 min read", 

    pageTitle: "Decentralized ID: Owning the Customer Relationship", 

    pageDescription: "The shift from platform-owned to user-owned identity. How Web3 tech is solving the biggest security headache in commerce.",

    heroImage: '/hero/decentralized-id-security-2026.avif'
  },
  '/insights/small-language-models-slm-enterprise.html': { 
    activePage: "insights", 

    category: "AI & GEO", 

    readTime: "11 min read", 

    pageTitle: "SLMs: Why Smaller is Better for Enterprise", 

    pageDescription: "Stop paying for GPT-4 overkill. How Small Language Models (SLMs) offer better security, lower costs, and higher precision.",

    heroImage: '/hero/small-language-models-slm-enterprise.avif'
  },
  '/insights/resilient-supply-chain-data-strategy.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "12 min read", 

    pageTitle: "Resilient Supply Chain Data: The 2026 Standard", 

    pageDescription: "Moving from 'Just-in-Time' to 'Just-in-Case'. Using predictive analytics to bypass the next global logistics crisis.",

    heroImage: '/hero/resilient-supply-chain-data-strategy.avif'
  },
  '/insights/community-led-growth-2026.html': { 
    activePage: "insights", 

    category: "SEO & Growth", 

    readTime: "15 min read", 

    pageTitle: "Community-Led Growth: The High-LTV Secret", 

    pageDescription: "Why your best marketing team is your customer base. Building defensible growth through gated communities and shared value.",

    heroImage: '/hero/community-led-growth-2026.avif'
  },
  '/insights/immersive-commerce-3d-ux-creative.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "10 min read", 

    pageTitle: "Immersive Commerce: 3D as the Baseline", 

    pageDescription: "If it's not 3D, it's invisible. How spatial computing is redefining the product detail page (PDP) in 2026.",

    heroImage: '/hero/immersive-commerce-3d-ux-creative.avif'
  },
  '/insights/ethical-ai-auditing-cybersecurity.html': { 
    activePage: "insights", 

    category: "Cybersecurity", 

    readTime: "13 min read", 

    pageTitle: "Ethical AI Auditing: Avoiding the PR Nightmare", 

    pageDescription: "Is your algorithm biased? Learn the technical framework for auditing AI models for fairness and regulatory compliance.",

    heroImage: '/hero/ethical-ai-auditing-cybersecurity.avif'
  },
  '/insights/multimodal-search-optimization-ai.html': { 
    activePage: "insights", 

    category: "AI & GEO", 

    readTime: "11 min read", 

    pageTitle: "Multimodal Search: Optimizing for Sight & Sound", 

    pageDescription: "Visual search and voice agents are the new primary inputs. How to optimize your assets for non-text discovery.",

    heroImage: '/hero/multimodal-search-optimization-ai.avif'
  },
  '/insights/headless-everything-architecture-2026.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "10 min read", 

    pageTitle: "Headless Everything: The Agility Moat", 

    pageDescription: "Why coupling your frontend and backend is a strategic liability. The 2026 roadmap to full composable architecture.",

    heroImage: '/hero/headless-everything-architecture-2026.avif'
  },
  '/insights/retention-loops-ai-growth-2026.html': { 
    activePage: "insights", 

    category: "SEO & Growth", 

    readTime: "12 min read", 

    pageTitle: "Retention Loops: Using AI to Kill Churn", 

    pageDescription: "Predicting churn before the user even knows they're leaving. Technical frameworks for automated, proactive retention.",

    heroImage: '/hero/retention-loops-ai-growth-2026.avif'
  },
  '/insights/emotional-design-logic-creative.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "9 min read", 

    pageTitle: "Emotional Design: The Logic of Feeling", 

    pageDescription: "Beyond aesthetics. How to use neuro-design principles to drive high-intent actions through visual storytelling.",

    heroImage: '/hero/emotional-design-logic-creative.avif'
  },
  '/insights/data-sovereignty-compliance-2026.html': { 
    activePage: "insights", 

    category: "Cybersecurity", 

    readTime: "14 min read", 

    pageTitle: "Data Sovereignty: The Geopolitical Stack", 

    pageDescription: "Why where your data sits is now a legal and strategic priority. Navigating the fragmentation of the global internet.",

    heroImage: '/hero/data-sovereignty-compliance-2026.avif'
  },
  '/insights/custom-gpt-enterprise-moat-ai.html': { 
    activePage: "insights", 

    category: "AI & GEO", 

    readTime: "11 min read", 

    pageTitle: "Enterprise GPTs: Turning Employees into Devs", 

    pageDescription: "How custom GPTs are democratizing software creation inside the enterprise. Risks, rewards, and the 2026 roadmap.",

    heroImage: '/hero/custom-gpt-enterprise-moat-ai.avif'
  },
  '/insights/circular-economy-data-strategy.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "12 min read", 

    pageTitle: "Circular Economy Data: Sustainability as Profit", 

    pageDescription: "Tracking lifecycle value beyond the first sale. How data enables profitable circular business models in 2026.",

    heroImage: '/hero/circular-economy-data-strategy.avif'
  },
  '/insights/cro-3-0-ai-growth.html': { 
    activePage: "insights", 

    category: "SEO & Growth", 

    readTime: "13 min read", 

    pageTitle: "CRO 3.0: The End of A/B Testing?", 

    pageDescription: "Why static A/B tests are too slow. Moving to real-time, AI-driven evolutionary UI that optimizes itself.",

    heroImage: '/hero/cro-3-0-ai-growth.avif'
  },
  '/insights/dynamic-creative-optimization-creative.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "10 min read", 

    pageTitle: "DCO: Creative at the Speed of Data", 

    pageDescription: "Using real-time API signals to change your ad creative every second. The 2026 playbook for performance creative.",

    heroImage: '/hero/dynamic-creative-optimization-creative.avif'
  },
  '/insights/m-and-a-tech-due-diligence-strategy.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "15 min read", 

    pageTitle: "M&A Tech Due Diligence: Finding the Hidden Debt", 

    pageDescription: "Buying a company is buying their technical debt. How to perform a deep-dive audit before the ink is dry.",

    heroImage: '/hero/m-and-a-tech-due-diligence-strategy.avif'
  },
  '/insights/shadow-ai-risk-2026.html': { 
    activePage: "insights", 

    category: "Cybersecurity", 

    readTime: "9 min read", 

    pageTitle: "Shadow AI Risk 2026: The $670,000 Breach Tax and How to Avoid It", 

    pageDescription: "Shadow AI triggers 20% of data breaches and adds $670,000 to the average incident cost. Learn the 3-tier governance framework to protect your balance sheet in 2026.",

    heroImage: "/hero/cybersecurity.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/shadow-ai-risk-2026",
  "headline": "Shadow AI Is Costing US Organizations an Extra $670,000 Per Breach in 2026 — Here’s the 3-Tier Governance Framework",
  "description": "Shadow AI triggers 20% of data breaches and adds $670,000 to the average incident cost. Learn the 3-tier governance framework to protect your balance sheet in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/shadow-ai-risk-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Digital Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/gbp-41-percent-actions-growth-2026.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "8 min read", 

    pageTitle: "Google Business Profile Actions Surged 41% in 2026 — Is Your Profile Ready?", 

    pageDescription: "Google Business Profile actions grew 41% YoY. Learn the exact 5-pillar optimization framework technical leads need and the revenue math CFOs require in 2026.",

    heroImage: "/hero/creative.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/gbp-41-percent-actions-growth-2026",
  "headline": "Google Business Profile Actions Surged 41% in 2026 — Is Your Profile Ready?",
  "description": "Google Business Profile actions grew 41% YoY. Learn the exact 5-pillar optimization framework technical leads need and the revenue math CFOs require in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/gbp-41-percent-growth-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Local SEO Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07",
  "hasPart": {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why did Google Business Profile actions grow 41% in 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Google shifted to popularity and helpfulness signals. Complete profiles with weekly engagement now feed both classic local pack and Gemini AI Overviews."
        }
      }
    ]
  }
}
</script>`
  },
  '/insights/core-web-vitals-2026-conversion-impact.html': { 
    activePage: "insights", 

    category: "Strategy", 

    readTime: "10 min read", 

    pageTitle: "Core Web Vitals in 2026: A 1-Second Improvement Can Lift Conversions by 7–12%", 

    pageDescription: "A 1-second improvement in LCP or INP can increase conversions by 7–12%. Learn why performance is now a revenue protection layer for SMBs in 2026.",

    heroImage: "/hero/strategy.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/core-web-vitals-2026-conversion-impact",
  "headline": "Core Web Vitals in 2026: A 1-Second Improvement Can Lift Conversions by 7–12%",
  "description": "A 1-second improvement in LCP or INP can increase conversions by 7–12%. Learn why performance is now a revenue protection layer for SMBs in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/core-web-vitals-2026-conversion-impact.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Technical Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/ai-search-traffic-2026-citation-strategy.html': { 
    activePage: "insights", 

    category: "AI", 

    readTime: "11 min read", 

    pageTitle: "AI Search Traffic Surged 527% in 2025 — How to Become the Source AI Cites", 

    pageDescription: "AI-referred sessions jumped 527% in 2025. Learn how to stop chasing rankings and start engineering citation for ChatGPT, Gemini, and Perplexity in 2026.",

    heroImage: "/hero/ai-search-traffic-2026-citation-strategy.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/ai-search-traffic-2026-citation-strategy",
  "headline": "AI Search Traffic Surged 527% in 2025 — How to Become the Source AI Cites",
  "description": "AI-referred sessions jumped 527% in 2025. Learn how to stop chasing rankings and start engineering citation for ChatGPT, Gemini, and Perplexity in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/ai-search-traffic-2026-citation-strategy.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of AI Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/cloud-migration-roi-2026.html': { 
    activePage: "insights", 

    category: "Advisory", 

    readTime: "12 min read", 

    pageTitle: "Cloud Migration ROI 2026: Delivering 1.9x Faster Customer Growth", 

    pageDescription: "Cloud-native organizations grow their customer base 1.9x faster. Learn why cloud is now a customer growth engine and how to accelerate your migration ROI.",

    heroImage: "/hero/cloud-migration-roi-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/cloud-migration-roi-2026",
  "headline": "Cloud Migration ROI 2026: Delivering 1.9x Faster Customer Growth",
  "description": "Cloud-native organizations grow their customer base 1.9x faster. Learn why cloud is now a customer growth engine and how to accelerate your migration ROI.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/cloud-migration-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Technical Advisory",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/rpa-cycle-time-reduction-2026.html': { 
    activePage: "insights", 

    category: "Advisory", 

    readTime: "9 min read", 

    pageTitle: "RPA ROI 2026: Achieving 60–90% Cycle Time Reduction for SMEs", 

    pageDescription: "RPA is delivering 60–90% cycle time reduction for SMEs in 2026. Learn the 90-day quick-start framework and how to turn operational drag into competitive advantage.",

    heroImage: "/hero/rpa-cycle-time-reduction-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/rpa-cycle-time-reduction-2026",
  "headline": "RPA ROI 2026: Achieving 60–90% Cycle Time Reduction for SMEs",
  "description": "RPA is delivering 60–90% cycle time reduction for SMEs in 2026. Learn the 90-day quick-start framework and how to turn operational drag into competitive advantage.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/rpa-roi-sme-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Operations Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/3d-motion-commerce-roi-2026.html': { 
    activePage: "insights", 

    category: "3D Commerce", 

    readTime: "12 min read", 

    pageTitle: "3D Commerce ROI 2026: 40%+ Conversion Lift and 40% Return Reduction", 

    pageDescription: "Interactive 3D and motion design increase conversions by 40% and cut returns by 40%. Learn why physics-based rendering is the \"JPEG of 2026\" for brands.",

    heroImage: "/hero/3d-motion-commerce-roi-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/3d-motion-commerce-roi-2026",
  "headline": "3D Commerce ROI 2026: 40%+ Conversion Lift and 40% Return Reduction",
  "description": "Interactive 3D and motion design increase conversions by 40% and cut returns by 40%. Learn why physics-based rendering is the \\"JPEG of 2026\\" for brands.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/3d-commerce-conversion-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of 3D Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/branding-consistency-revenue-leak-2026.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "8 min read", 

    pageTitle: "Branding Consistency 2026: Why Inconsistent Branding Is a Silent Revenue Leak", 

    pageDescription: "Inconsistent branding across physical and digital touchpoints erodes trust and leaks revenue. Learn the 2026 framework for a unified Brand Operating System.",

    heroImage: "/hero/creative.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/branding-consistency-revenue-leak-2026",
  "headline": "Branding Consistency 2026: Why Inconsistent Branding Is a Silent Revenue Leak",
  "description": "Inconsistent branding across physical and digital touchpoints erodes trust and leaks revenue. Learn the 2026 framework for a unified Brand Operating System.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/branding-consistency-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Brand Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/vciso-roi-cybersecurity-leadership-2026.html': { 
    activePage: "insights", 

    category: "Cybersecurity", 

    readTime: "10 min read", 

    pageTitle: "vCISO ROI 2026: Executive-Level Cybersecurity Leadership for 30–70% Less", 

    pageDescription: "A virtual CISO delivers 30–70% cost savings and up to 28% lower insurance premiums. Learn why vCISO is the pragmatic security model for SMBs in 2026.",

    heroImage: "/hero/cybersecurity.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/vciso-roi-cybersecurity-leadership-2026",
  "headline": "vCISO ROI 2026: Executive-Level Cybersecurity Leadership for 30–70% Less",
  "description": "A virtual CISO delivers 30–70% cost savings and up to 28% lower insurance premiums. Learn why vCISO is the pragmatic security model for SMBs in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/vciso-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/local-seo-roi-backyard-dominance-2026.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "11 min read", 

    pageTitle: "Local SEO ROI 2026: Claiming Backyard Dominance and Avoiding the \"Competitor Tax\"", 

    pageDescription: "Bad local SEO is a direct hand-off of profitable customers to your competitors. Learn the 2026 framework for local dominance and AI Overview citation.",

    heroImage: "/hero/creative.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/local-seo-roi-backyard-dominance-2026",
  "headline": "Local SEO ROI 2026: Claiming Backyard Dominance and Avoiding the 'Competitor Tax'",
  "description": "Bad local SEO is a direct hand-off of profitable customers to your competitors. Learn the 2026 framework for local dominance and AI Overview citation.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/local-seo-backyard-dominance-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Local SEO",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/fractional-cdo-roi-2026.html': { 
    activePage: "insights", 

    category: "Advisory", 

    readTime: "12 min read", 

    pageTitle: "Fractional CDO ROI 2026: Bridging the Strategic Technology Gap for 3–5x Returns", 

    pageDescription: "Most SMBs suffer from strategic drift. Learn how a fractional CDO aligns technology with revenue goals to deliver 3–5x ROI without the $300k executive salary.",

    heroImage: "/hero/fractional-cdo-roi-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/fractional-cdo-roi-2026",
  "headline": "Fractional CDO ROI 2026: Bridging the Strategic Technology Gap for 3–5x Returns",
  "description": "Most SMBs suffer from strategic drift. Learn how a fractional CDO aligns technology with revenue goals to deliver 3–5x ROI without the $300k executive salary.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/fractional-cdo-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Digital Advisory",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/secure-rag-pipelines-2026.html': { 
    activePage: "insights", 

    category: "AI", 

    readTime: "10 min read", 

    pageTitle: "Secure RAG Pipelines 2026: Protecting Intellectual Property in the Era of LLMs", 

    pageDescription: "RAG is a powerful AI pattern, but insecure deployments risk IP theft. Learn the 6-stage secure pipeline for enterprise RAG systems in 2026.",

    heroImage: "/hero/secure-rag-pipelines-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/secure-rag-pipelines-2026",
  "headline": "Secure RAG Pipelines 2026: Protecting Intellectual Property in the Era of LLMs",
  "description": "RAG is a powerful AI pattern, but insecure deployments risk IP theft. Learn the 6-stage secure pipeline for enterprise RAG systems in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/secure-rag-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of AI Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/real-photography-roi-2026.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "9 min read", 

    pageTitle: "Real Photography ROI 2026: Why Stock Images Are Quietly Killing Your Conversions", 

    pageDescription: "Authentic photography can increase conversions by 60–70% and reduce returns by 30%. Learn the 2026 standard for high-impact visual trust.",

    heroImage: "/hero/creative.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/real-photography-roi-2026",
  "headline": "Real Photography ROI 2026: Why Stock Images Are Quietly Killing Your Conversions",
  "description": "Authentic photography can increase conversions by 60–70% and reduce returns by 30%. Learn the 2026 standard for high-impact visual trust.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/real-photography-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Creative Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/video-landing-page-conversion-2026.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "10 min read", 

    pageTitle: "Video Landing Page ROI 2026: Lifting Conversions by 80% and Email CTR by 300%", 

    pageDescription: "Landing pages with video convert 80% better. Learn the 2026 playbook for high-performance video and how to protect your Core Web Vitals.",

    heroImage: "/hero/creative.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/video-landing-page-conversion-2026",
  "headline": "Video Landing Page ROI 2026: Lifting Conversions by 80% and Email CTR by 300%",
  "description": "Landing pages with video convert 80% better. Learn the 2026 playbook for high-performance video and how to protect your Core Web Vitals.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/video-landing-page-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Content Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/brand-consistency-roi-2026.html': { 
    activePage: "insights", 

    category: "Creative", 

    readTime: "11 min read", 

    pageTitle: "Brand Consistency ROI 2026: Why Professional Branding Drives 23% Revenue Growth", 

    pageDescription: "Consistent branding increases revenue by 23%. Learn the 2026 standard for the Modern Brand Operating System and how to secure your first impression.",

    heroImage: "/hero/creative.png",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/brand-consistency-roi-2026",
  "headline": "Brand Consistency ROI 2026: Why Professional Branding Drives 23% Revenue Growth",
  "description": "Consistent branding increases revenue by 23%. Learn the 2026 standard for the Modern Brand Operating System and how to secure your first impression.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/brand-consistency-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/morgan-ellis",
    "name": "Morgan Ellis",
    "jobTitle": "Head of Brand Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/security-awareness-training-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "10 min read", 

    pageTitle: "Security Awareness Training 2026: Reducing Incidents by 67% with Simulation", 

    pageDescription: "Security training reduces incidents by 67%. Learn the 2026 playbook for phishing simulations and how to turn your team into a defense layer.",

    heroImage: "/hero/security-awareness-training-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/security-awareness-training-2026",
  "headline": "Security Awareness Training 2026: Reducing Incidents by 67% with Simulation",
  "description": "Security training reduces incidents by 67%. Learn the 2026 playbook for phishing simulations and how to turn your team into a defense layer.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/security-awareness-training-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/ai-as-a-service-roi-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "12 min read", 

    pageTitle: "AI-as-a-Service ROI 2026: Enterprise AI Without the $200k Data Science Team", 

    pageDescription: "AI-as-a-Service is growing at 36.8% CAGR. Learn how SMBs access enterprise AI capabilities with faster ROI and lower risk in 2026.",

    heroImage: "/hero/ai-as-a-service-roi-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/ai-as-a-service-roi-2026",
  "headline": "AI-as-a-Service ROI 2026: Enterprise AI Without the $200k Data Science Team",
  "description": "AI-as-a-Service is growing at 36.8% CAGR. Learn how SMBs access enterprise AI capabilities with faster ROI and lower risk in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/ai-as-a-service-roi-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/casey-hayes",
    "name": "Casey Hayes",
    "jobTitle": "Head of AI Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/backup-readiness-ransomware-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "10 min read", 

    pageTitle: "Backup Readiness 2026: Why 95% of SMBs are One Ransomware Event from Failure", 

    pageDescription: "Only 5% of SMBs have tested recovery plans. Learn the 3-2-1-1-0 backup rule and how to ensure your business survives a ransomware attack.",

    heroImage: "/hero/backup-readiness-ransomware-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/backup-readiness-ransomware-2026",
  "headline": "Backup Readiness 2026: Why 95% of SMBs are One Ransomware Event from Failure",
  "description": "Only 5% of SMBs have tested recovery plans. Learn the 3-2-1-1-0 backup rule and how to ensure your business survives a ransomware attack.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/backup-readiness-ransomware-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/proactive-patching-compliance-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "9 min read", 

    pageTitle: "Proactive Patching 2026: Achieving 94-100% Compliance to Stop Breaches", 

    pageDescription: "Managed environments hit 94-100% patch compliance while others struggle at 60%. Learn the 2026 framework for automated, risk-based patching.",

    heroImage: "/hero/proactive-patching-compliance-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/proactive-patching-compliance-2026",
  "headline": "Proactive Patching 2026: Achieving 94-100% Compliance to Stop Breaches",
  "description": "Managed environments hit 94-100% patch compliance while others struggle at 60%. Learn the 2026 framework for automated, risk-based patching.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/proactive-patching-compliance-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/ransomware-smb-threat-reality-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "11 min read", 

    pageTitle: "Ransomware SMB Threat Reality 2026: 88% of Breaches Now Involve Ransomware", 

    pageDescription: "Ransomware is the #1 threat to SMBs in 2026. Learn why 88% of breaches involve ransomware and the core defenses you need to survive.",

    heroImage: "/hero/ransomware-smb-threat-reality-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/ransomware-smb-threat-reality-2026",
  "headline": "Ransomware SMB Threat Reality 2026: 88% of Breaches Now Involve Ransomware",
  "description": "Ransomware is the #1 threat to SMBs in 2026. Learn why 88% of breaches involve ransomware and the core defenses you need to survive.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/ransomware-smb-threat-reality-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/three-primary-attack-vectors-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "10 min read", 

    pageTitle: "The 3 Attack Vectors Killing SMBs in 2026: Credentials, Vulnerabilities, Phishing", 

    pageDescription: "Three attack vectors account for 57% of all SMB breaches. Learn how to block the front, side, and back doors with the 2026 defense framework.",

    heroImage: "/hero/three-primary-attack-vectors-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/three-primary-attack-vectors-2026",
  "headline": "The 3 Attack Vectors Killing SMBs in 2026: Credentials, Vulnerabilities, Phishing",
  "description": "Three attack vectors account for 57% of all SMB breaches. Learn how to block the front, side, and back doors with the 2026 defense framework.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/three-primary-attack-vectors-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/cyber-insurance-compliance-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "11 min read", 

    pageTitle: "Cyber Insurance Compliance 2026: From Questionnaires to Technical Audits", 

    pageDescription: "In 2026, cyber insurance carriers require verifiable technical controls. Learn the framework for achieving compliance and securing preferred rates.",

    heroImage: "/hero/cyber-insurance-compliance-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/cyber-insurance-compliance-2026",
  "headline": "Cyber Insurance Compliance 2026: From Questionnaires to Technical Audits",
  "description": "In 2026, cyber insurance carriers require verifiable technical controls. Learn the framework for achieving compliance and securing preferred rates.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/cyber-insurance-compliance-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/ransomware-cost-analysis-cfo-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "12 min read", 

    pageTitle: "Ransomware Cost Analysis 2026: The $11M Reality for SMB Leadership", 

    pageDescription: "Ransom payments are just 1% of the cost. Learn the hidden $11M anatomy of a ransomware event and how CFOs can mitigate the total cost of risk.",

    heroImage: "/hero/ransomware-cost-analysis-cfo-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/ransomware-cost-analysis-cfo-2026",
  "headline": "Ransomware Cost Analysis 2026: The $11M Reality for SMB Leadership",
  "description": "Ransom payments are just 1% of the cost. Learn the hidden $11M anatomy of a ransomware event and how CFOs can mitigate the total cost of risk.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/ransomware-cost-analysis-cfo-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/data-privacy-security-2026.html': { 
    activePage: "insights", 

    category: "Compliance", 

    readTime: "10 min read", 

    pageTitle: "Data Privacy Security 2026: From Compliance to Integrated Governance", 

    pageDescription: "Privacy is no longer a checklist. Learn how to build structural trust via data minimization, zero-trust access, and automated governance in 2026.",

    heroImage: "/hero/data-privacy-security-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/data-privacy-security-2026",
  "headline": "Data Privacy Security 2026: From Compliance to Integrated Governance",
  "description": "Privacy is no longer a checklist. Learn how to build structural trust via data minimization, zero-trust access, and automated governance in 2026.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/data-privacy-security-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/proactive-it-operations-2026.html': { 
    activePage: "insights", 

    category: "Technology", 

    readTime: "11 min read", 

    pageTitle: "Proactive IT Operations 2026: Turning IT from a Cost Center to an Engine", 

    pageDescription: "Break-fix is dead. Learn how proactive IT increases operational profitability by 30% through automated monitoring, patching, and strategic lifecycle management.",

    heroImage: "/hero/proactive-it-operations-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/proactive-it-operations-2026",
  "headline": "Proactive IT Operations 2026: Turning IT from a Cost Center to an Engine",
  "description": "Break-fix is dead. Learn how proactive IT increases operational profitability by 30% through automated monitoring, patching, and strategic lifecycle management.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/proactive-it-operations-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },
  '/insights/strategic-it-business-growth-2026.html': { 
    activePage: "insights", 

    category: "Strategic Growth", 

    readTime: "12 min read", 

    pageTitle: "Strategic IT for Business Growth 2026: Scaling with Purpose", 

    pageDescription: "IT is the accelerator of growth. Learn how to align technology strategy with your business goals to out-maneuver competitors and scale without friction.",

    heroImage: "/hero/strategic-it-business-growth-2026.avif",

    pageSchema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://sunder.co/insights/strategic-it-business-growth-2026",
  "headline": "Strategic IT for Business Growth 2026: Scaling with Purpose",
  "description": "IT is the accelerator of growth. Learn how to align technology strategy with your business goals to out-maneuver competitors and scale without friction.",
  "image": {
    "@type": "ImageObject",
    "url": "https://sunder.co/hero/strategic-it-business-growth-2026.avif",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "@id": "https://sunder.co/team/jordan-vance",
    "name": "Jordan Vance",
    "jobTitle": "Head of Cybersecurity Strategy",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://sunder.co/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://sunder.co/#organization",
    "name": "Sunder & Co."
  },
  "datePublished": "2026-05-07",
  "dateModified": "2026-05-07"
}
</script>`
  },

  '/insights/3d-visualization-roi.html': { 
    activePage: "insights", 
    category: "Creative", 
    readTime: "10 min read", 
    pageTitle: "3D Product Visualization ROI: The 2026 Shift", 
    metaDescription: "Why replacing photography with 3D PBR rendering delivers 70% cost savings and 94% conversion lift.",
    heroImage: "/hero/creative.png"
  },
  '/insights/b2b-lead-generation-roi.html': { 
    activePage: "insights", 
    category: "Growth", 
    readTime: "10 min read", 
    pageTitle: "B2B Lead Generation ROI: The 544% RevOps Engine", 
    metaDescription: "Automating the middle-of-funnel to reduce CAC by 60% while 4xing lead-to-meeting rates.",
    heroImage: "/hero/growth.png"
  },
  '/insights/interactive-kiosk-roi.html': { 
    activePage: "insights", 
    category: "Creative", 
    readTime: "10 min read", 
    pageTitle: "Interactive Phygital Kiosks: Bridging the Showroom Gap", 
    metaDescription: "How interactive hardware delivers a 22% sales lift and 28% labor savings for industrial brands.",
    heroImage: "/hero/creative.png"
  },
  '/insights/erp-ecommerce-integration-roi.html': { 
    activePage: "insights", 
    category: "Strategy", 
    readTime: "10 min read", 
    pageTitle: "ERP & E-commerce Integration: Eliminating Data Debt", 
    metaDescription: "Resolving the $1.2M annual cost of data silos between warehouse and web storefronts.",
    heroImage: "/hero/strategy.png"
  },
  '/insights/martech-stack-audit-roi.html': { 
    activePage: "insights", 
    category: "Strategy", 
    readTime: "10 min read", 
    pageTitle: "MarTech Stack Audit: Finding the Leaks in Your Stack", 
    metaDescription: "A technical framework for auditing and optimizing B2B marketing technology for maximum yield.",
    heroImage: "/hero/strategy.png"
  },
  '/insights/whale-curve-dealer-rationalization.html': { 
    activePage: "insights", 
    category: "Growth", 
    readTime: "10 min read", 
    pageTitle: "The Whale Curve: Dealer Rationalization for 2026", 
    metaDescription: "Using profit-centric data to identify your most (and least) valuable distribution partners.",
    heroImage: "/hero/growth.png"
  },
  '/insights/custom-ai-copilot-roi.html': { 
    activePage: "insights", 
    category: "AI & GEO", 
    readTime: "10 min read", 
    pageTitle: "Custom Enterprise AI Copilots: The ROI of Proprietary Intel", 
    metaDescription: "Building private LLM nodes to protect strategic data while 10xing internal productivity.",
    heroImage: "/hero/ai_geo.png"
  },
  '/insights/leaky-funnel-lost-revenue-audit.html': { 
    activePage: "insights", 
    category: "Growth", 
    readTime: "10 min read", 
    pageTitle: "Leaky Funnel Audit: Recovering Lost Revenue", 
    metaDescription: "Identifying the technical and psychological friction points that kill B2B conversions.",
    heroImage: "/hero/growth.png"
  },
  '/insights/automated-competitive-intelligence-roi.html': { 
    activePage: "insights", 
    category: "Strategy", 
    readTime: "10 min read", 
    pageTitle: "Automated Competitive Intel: Winning on Autopilot", 
    metaDescription: "Using automated scrapers and intent data to monitor market shifts in real-time.",
    heroImage: "/hero/strategy.png"
  },
  '/insights/b2b-sales-enablement-roi.html': { 
    activePage: "insights", 
    category: "Growth", 
    readTime: "10 min read", 
    pageTitle: "B2B Sales Enablement: The ROI of High-Intent Content", 
    metaDescription: "Equipping sales teams with deterministic data and interactive tools to shorten cycles by 31%.",
    heroImage: "/hero/growth.png"
  },
  '/insights/omnichannel-catalog-syndication-pim.html': { 
    activePage: "insights", 
    category: "Strategy", 
    readTime: "10 min read", 
    pageTitle: "Omnichannel Syndication: The PIM Strategy for Scale", 
    metaDescription: "Centralizing product data to enable global scale across 50+ marketplaces and distributors.",
    heroImage: "/hero/strategy.png"
  },
  '/insights/digital-twins-virtual-showrooms-roi.html': { 
    activePage: "insights", 
    category: "Creative", 
    readTime: "10 min read", 
    pageTitle: "Digital Twins & Virtual Showrooms: The Future of B2B Touring", 
    metaDescription: "Creating immersive, high-fidelity digital environments that replace physical facility tours.",
    heroImage: "/hero/creative.png"
  },};









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
