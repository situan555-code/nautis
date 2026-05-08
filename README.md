# Sunder & Co. — nautis

**High-end B2B agency portfolio + lead generation site** for Sunder & Co. (Fractional CDO / Revenue Operations consultancy).

Built with Vite + React 19 + Three.js + heavy AI assistance.

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/situan555-code/nautis.git
cd nautis

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## 📁 Project Structure

```
nautis/
├── README.md
├── package.json
├── vite.config.js          # ⚠️ Currently bloated — see "Refactoring" below
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── public/                   # Static assets (images, models, icons)
├── src/
│   ├── index.html            # Home
│   ├── about.html
│   ├── services-*.html       # Advisory / Technology / Creative
│   ├── case-studies.html
│   ├── engagement.html
│   ├── contact.html
│   ├── insights.html         # Hub + 30+ insight articles
│   ├── css/                  # Global + page-specific styles
│   ├── js/                   # Modular JavaScript (excellent)
│   │   ├── main.js           # Orchestrator
│   │   ├── shared.js         # Nav + Footer + utilities
│   │   ├── calculators.js    # ⭐ 12 ROI calculators (best part)
│   │   ├── search.js, filters.js, nav.js, etc.
│   ├── data/
│   │   ├── site.json         # Core site data
│   │   └── searchIndex.json
│   ├── partials/             # Handlebars partials (nav, footer, head)
│   └── insights/             # Individual insight pages
├── scripts/                  # Python asset processing tools
│   ├── process_all_icons.py
│   ├── crop_icons.py
│   ├── fix_icons.py
│   └── process_kiosk.py
├── document_instructions_to_agent.md   # 🧠 Massive AI prompt / business playbook
├── blogs.md                  # Content dump
└── .venv / .npm-cache        # Mixed Python + Node environment
```

---

## 🛠 Tech Stack

- **Build**: Vite 6 + Handlebars templating
- **Frontend**: React 19 + Three.js (3D commerce)
- **Styling**: Custom CSS + modern design system
- **Interactivity**: 12 ROI calculators, search, filters, smooth scroll, counters, accordions
- **Asset Pipeline**: Python scripts for icon/3D model processing
- **AI Assistance**: Heavy use of fast models for content + code generation

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier formatting |
| `npm run prebuild` | Run `scripts/optimize-models.js` (if exists) |

---

## 🧠 Key Files Explained

### `document_instructions_to_agent.md`
This is the **brain** of the project. It contains:
- Detailed business strategy for Sunder & Co.
- AI agent instructions for content generation
- Client narrative frameworks
- 2026 market positioning

**Do not edit lightly** — this file drives much of the site's content and tone.

### `vite.config.js` (Current State)
**Warning**: This file is currently **58kB** and contains a massive hardcoded `pageContext` object with 30+ full insight pages + JSON-LD schema.

**Planned Refactor** (see below):
- Move all page metadata to `src/data/pages/*.json`
- Keep config clean and maintainable

### `src/js/calculators.js`
**Best file in the repo**. 12 different ROI calculators with clean logic, formatters, and CSP-compliant implementation. Production-grade.

---

## 🔧 Python Asset Pipeline

Located in `scripts/`:

- `process_all_icons.py` — Batch process icons for web/kiosk
- `crop_icons.py` — Crop and optimize icons
- `fix_icons.py` — Fix icon metadata/issues
- `process_kiosk.py` — Prepare assets for interactive kiosk deployments

**Setup**:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # (create if needed)
```

These scripts are used during content production for 3D commerce and kiosk projects.

---

## 🚨 Current Technical Debt (May 2026)

| Issue | Severity | Status | Owner |
|-------|----------|--------|-------|
| No README.md | High | **Fixed** (this PR) | — |
| `vite.config.js` bloat (58kB hardcoded) | High | **In Progress** | Flash Agent |
| `nautis-portfolio` (0-byte file) | Low | Needs cleanup | Flash Agent |
| `build_error.txt` present | Medium | Investigate + delete | Flash Agent |
| Missing `.env.example` | Medium | **Fixed** (this PR) | — |
| Python tooling undocumented | Medium | **Fixed** (this README) | — |
| Repetitive AI-generated copy | Medium | Content review pass needed | Content Owner |

---

## 🗺 Refactoring Roadmap (High Priority)

### Phase 1 — Config Cleanup (Next 1-2 days)
1. Create `src/data/pages/` directory
2. Extract each insight page's metadata into individual JSON files
3. Update `vite.config.js` to dynamically load from JSON
4. Reduce config size from 58kB → <5kB

### Phase 2 — Content Quality (This week)
- Run flash agent through all insight pages with voice consistency prompt
- Fix repetitive phrasing
- Ensure every page has unique value proposition

### Phase 3 — Performance (Next sprint)
- Add lazy loading for Three.js scenes
- Implement image optimization pipeline using existing Python scripts
- Add Lighthouse CI

---

## 🤝 Contributing

This project is built with heavy AI assistance ("flash model"). The goal is **speed + quality**.

When adding new insight pages:
1. Create the HTML file in `src/insights/`
2. Add metadata to `src/data/pages/`
3. Update `searchIndex.json` if needed
4. Run `npm run build` and verify no errors

---

## 📬 Contact

- **Email**: hello@sunderandco.com
- **LinkedIn**: https://linkedin.com (update with real link)
- **Site**: https://sunder.co (when live)

---

**Built with precision.**

*Last updated: May 8, 2026*