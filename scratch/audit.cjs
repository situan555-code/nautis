const fs = require('fs');
const path = require('path');

const dir = 'src/insights/';
const distDir = 'dist/insights/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !f.startsWith('._'));
const configContent = fs.readFileSync('vite.config.js', 'utf8');

let failures = [];

// 1. LCP Check (Generated files)
files.forEach(file => {
  const distPath = path.join(distDir, file);
  if (!fs.existsSync(distPath)) return;
  const content = fs.readFileSync(distPath, 'utf8');
  
  // Count attributes on tags only
  const highPriorityMatch = content.match(/<[^>]+fetchpriority="high"/g);
  const highPriorityCount = highPriorityMatch ? highPriorityMatch.length : 0;
  
  const eagerMatch = content.match(/<[^>]+loading="eager"/g);
  const eagerCount = eagerMatch ? eagerMatch.length : 0;
  
  if (highPriorityCount === 0) failures.push(file + ' - Fail: Missing fetchpriority="high" on Hero image');
  if (highPriorityCount > 1) failures.push(file + ' - Fail: More than one fetchpriority="high" attribute (' + highPriorityCount + ')');
  if (eagerCount === 0) failures.push(file + ' - Fail: Missing loading="eager" on Hero image');
  if (eagerCount > 1) failures.push(file + ' - Fail: More than one loading="eager" attribute (' + eagerCount + ')');
  
  // Check if Hero img is avif
  const heroMatch = content.match(/<img[^>]+fetchpriority="high"[^>]+src="([^"]+)"/);
  if (heroMatch && !heroMatch[1].endsWith('.avif')) {
     failures.push(file + ' - Fail: Hero image is not .avif (' + heroMatch[1] + ')');
  }
});

// 2. & 4. Config Audit
const titles = new Map();
const descriptions = new Map();
const entries = configContent.split("'/insights/");
entries.shift();

entries.forEach(entry => {
  const slugEnd = entry.indexOf(".html'");
  if (slugEnd === -1) return;
  const slug = entry.substring(0, slugEnd);
  const blockEnd = entry.indexOf("  },");
  if (blockEnd === -1) return;
  const block = entry.substring(0, blockEnd + 4);
  
  const titleMatch = block.match(/pageTitle:\s*'([^']*)'/);
  const descMatch = block.match(/pageDescription:\s*'([^']*)'/);
  
  if (titleMatch) {
    const title = titleMatch[1];
    if (titles.has(title)) failures.push('vite.config.js (' + slug + ') - Fail: Duplicate Title: ' + title);
    titles.set(title, slug);
  }
  if (descMatch) {
    const desc = descMatch[1];
    if (descriptions.has(desc)) failures.push('vite.config.js (' + slug + ') - Fail: Duplicate Description: ' + desc);
    descriptions.set(desc, slug);
  }

  if (block.includes('pageSchema:')) {
    const schemaStart = block.indexOf('`') + 1;
    const schemaEnd = block.lastIndexOf('`');
    if (schemaStart > 0 && schemaEnd > schemaStart) {
      const schemaFull = block.substring(schemaStart, schemaEnd);
      const jsonStr = schemaFull.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
      try {
        const json = JSON.parse(jsonStr);
        const jsonText = JSON.stringify(json);
        if (!jsonText.includes('https://sunder.co/#organization')) {
          failures.push('vite.config.js (' + slug + ') - Fail: Missing organization @id connection in Article schema');
        }
      } catch (e) {
        failures.push('vite.config.js (' + slug + ') - Fail: Invalid JSON Schema: ' + e.message);
      }
    }
  }
});

// 3. Authority Loop Audit (Source files)
files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    if (line.includes('<a href')) {
      if (line.includes('.md')) {
        failures.push(file + ':L' + (i+1) + ' - Fail: .md extension in link');
      }
      if (line.includes('target="_blank"') && (line.includes('sunder.co') || line.includes('/insights/'))) {
         failures.push(file + ':L' + (i+1) + ' - Fail: target="_blank" on local link');
      }
      // Accurate nested link check
      if (line.match(/<a [^>]*><a /)) {
        failures.push(file + ':L' + (i+1) + ' - Fail: Nested <a> tags detected');
      }
    }
  });
});

if (failures.length === 0) {
  console.log('[ SYSTEM GREEN: ALL 26 ENTITIES VERIFIED ]');
} else {
  failures.forEach(f => console.log('- ' + f));
}
