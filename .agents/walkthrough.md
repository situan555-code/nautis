# Sunder & Co. Insights Engine Walkthrough

## Overview
The "Insights Engine" is a research-backed content hub designed to position Sunder & Co. as a data-driven authority in B2B service niches. It features 12 high-conversion articles with integrated ROI models and searchability.

## Key Features
- **12 ROI-Focused Articles**: Covering 3D visualization, ERP integration, AI copilots, and more.
- **Handlebars Block Architecture**: Robust rendering pipeline that handles complex HTML and special characters.
- **Real-Time Search**: Powered by Fuse.js with a cache-busted search index.
- **Premium UI/UX**: Responsive grid with CSS-based category filtering.

## Technical Implementation
### Handlebars Blocks
We transitioned from string-based parameters to block partials:
```handlebars
{{#> insight-layout }}
  <!-- Raw HTML Content -->
{{/insight-layout}}
```

### Search Index
The index is located in `src/data/searchIndex.json` and is fetched with a cache-buster:
```javascript
const response = await fetch(`/data/searchIndex.json?v=${new Date().getTime()}`);
```

## Articles List
1. 3D Product Visualization ROI
2. B2B Lead Generation (RevOps)
3. Interactive Kiosk ROI
4. ERP-E-commerce Integration
5. MarTech Stack Audit
6. Whale Curve Dealer Rationalization
7. Custom AI Copilots (RAG)
8. Automated Competitive Intelligence
9. B2B Sales Enablement
10. PIM / Omnichannel Syndication
11. Leaky Funnel Recovery
12. Digital Twins & Virtual Showrooms

## Verification Results
- **Build Status**: Passed (`npm run build`)
- **Render Check**: Verified via browser subagent. All tables and text blocks are clean.
- **Search Check**: Verified indexing of new topics.
