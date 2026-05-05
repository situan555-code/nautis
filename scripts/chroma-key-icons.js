import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = '/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368';
const outDir = '/Volumes/raid4/Antigravity IDE/Resume Website/public/case-studies/icons';

const targets = [
  // New Studio Light icon for Product Photos
  { file: 'icon_studiolight_1776533157685.png', out: 'icon_studiolight.png', bg: 'green', cropText: false },
];

async function removeBackground() {
  for (const t of targets) {
    const rawPath = path.join(artifactsDir, t.file);
    const outPath = path.join(outDir, t.out);
    
    if (!fs.existsSync(rawPath)) {
      console.log(`Missing: ${rawPath}`);
      continue;
    }

    try {
      let pipeline = sharp(rawPath);
      
      if (t.cropText) {
         pipeline = pipeline.extract({ left: 100, top: 100, width: 824, height: 750 });
      } else {
         pipeline = pipeline.extract({ left: 50, top: 50, width: 924, height: 924 });
      }

      const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        let isBg = false;

        if (t.bg === 'green') {
          if (g > r + 15 && g > b + 15) {
             isBg = true;
          }
          if (r < 30 && b < 30 && g > 20) {
             isBg = true;
          }
          if (g > 150 && r < 50 && b < 50) {
             isBg = true;
          }
        }
        
        if (isBg) {
          data[i + 3] = 0; // Transparent
        }
      }

      await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      })
      .resize(128, 128, { kernel: 'nearest' })
      .toFile(outPath);

      console.log(`✅ Processed ${t.out} successfully.`);

    } catch (err) {
      console.error(`❌ Failed on ${t.file}:`, err);
    }
  }
}

removeBackground();
