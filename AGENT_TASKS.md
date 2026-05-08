# Flash Agent Task List — nautis Refactor

**Owner**: Flash Agent (with human review)
**Priority**: High
**Deadline**: This week

---

## ✅ Completed (by Grok)

- [x] Added comprehensive `README.md`
- [x] Added `.env.example`
- [x] Deleted zero-byte `nautis-portfolio` file
- [x] Created `src/data/pages/.gitkeep` (ready for content)

---

## 🔴 High Priority Tasks (Do These First)

### 1. Delete `build_error.txt`

```bash
# Run this
rm build_error.txt
git add build_error.txt
git commit -m "chore: Remove build_error.txt (resolved)"
git push
```

**Why**: It's noise. The build issues were investigated and fixed.

---

### 2. Refactor `vite.config.js` (Biggest Win)

**Current Problem**: 58kB file with everything hardcoded. Extremely hard to maintain.

**Goal**: Reduce to <5kB + external JSON data.

#### Step-by-Step Instructions:

1. **Create directory structure**:
   ```
   mkdir -p src/data/pages
   ```

2. **Extract insight page data**:
   - For each insight page (e.g. `shadow-ai-risk-2026`), create:
     `src/data/pages/shadow-ai-risk-2026.json`
   - Structure example:
     ```json
     {
       "slug": "shadow-ai-risk-2026",
       "title": "Shadow AI Risk 2026: The $670,000 Breach Tax and How to Avoid It",
       "category": "Cybersecurity",
       "readTime": "9 min read",
       "heroImage": "/hero/shadow-ai-risk-2026.avif",
       "description": "...",
       "pageSchema": "<script type=\"application/ld+json\">...full schema...</script>"
     }
     ```

3. **Update `vite.config.js`**:
   - Replace the massive `pageContext` object with dynamic loading:
     ```js
     import { readdirSync, readFileSync } from 'fs';
     import { resolve } from 'path';

     const pagesDir = resolve(__dirname, 'src/data/pages');
     const insightFiles = readdirSync(pagesDir).filter(f => f.endsWith('.json'));

     const insightPages = insightFiles.map(file => {
       const data = JSON.parse(readFileSync(resolve(pagesDir, file), 'utf-8'));
       return data;
     });

     // Then use insightPages to build the input + context
     ```

4. **Test**:
   ```bash
   npm run build
   ```
   - Should produce identical output
   - No errors

**Estimated time**: 2-3 hours (mostly copy-paste from current config)

---

### 3. Content Quality Pass (Flash Model Speciality)

**Task**: Review all 30+ insight pages for voice consistency and AI artifacts.

**Prompt to use**:
```
You are a senior B2B consultant at Sunder & Co. Review this insight page.

Check for:
- Repetitive sentence structures typical of flash models
- Generic phrases like "In 2026..." without specific data
- Inconsistent tone between pages
- Missing unique value propositions

Rewrite any weak sections to sound like a sharp, battle-tested operator who has actually done this work.

Keep the technical depth but make it punchier and more human.
```

**Priority pages** (highest traffic/impact):
1. `shadow-ai-risk-2026.html`
2. `ai-search-moat-beyond-sge.html`
3. `post-roi-governance-2026.html`
4. `zero-party-data-growth-2026.html`
5. `agentic-workflows-productivity-2026.html`

---

## 🟡 Medium Priority (This Week)

### 4. Add `.gitignore` improvements

Add these lines if missing:
```
# Python
__pycache__/
*.py[cod]
*$py.class

# IDE
.idea/
.vscode/

# Large assets (if you add real 3D models)
*.glb
*.gltf
public/models/raw/
```

### 5. Create `requirements.txt` for Python tooling

```txt
Pillow>=10.0.0
numpy>=1.26.0
# Add others as needed
```

Place in root and update README.

### 6. Performance Quick Wins

- Add `loading="lazy"` to all non-hero images in insight pages
- Add `defer` to non-critical scripts
- Test Core Web Vitals on 2-3 key pages

---

## 🟢 Low Priority (Next Sprint)

- Set up GitHub Actions for build + Lighthouse CI
- Implement proper image optimization pipeline using existing Python scripts
- Add error boundaries to React components
- Create a "What's New" changelog page

---

## 📋 Verification Checklist (After Each Task)

- [ ] `npm run build` succeeds with no errors
- [ ] `npm run dev` works locally
- [ ] No console errors in browser
- [ ] README still accurate
- [ ] Flash agent didn't break anything (human review)

---

**Last Updated**: May 8, 2026
**Next Review**: After config refactor complete
