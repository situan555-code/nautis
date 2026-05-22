import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../asset-source/icons');
const outDir = path.resolve(__dirname, '../public/case-studies/icons');

const targets = [
  { file: 'icon_studiolight.png', out: 'icon_studiolight.png', bg: 'green', cropText: false },
];

async function removeBackground() {
  for (const target of targets) {
    const rawPath = path.join(sourceDir, target.file);
    const outPath = path.join(outDir, target.out);

    if (!fs.existsSync(rawPath)) {
      console.log(`Missing: ${rawPath}`);
      continue;
    }

    try {
      let pipeline = sharp(rawPath);

      if (target.cropText) {
        pipeline = pipeline.extract({ left: 100, top: 100, width: 824, height: 750 });
      } else {
        pipeline = pipeline.extract({ left: 50, top: 50, width: 924, height: 924 });
      }

      const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let isBackground = false;

        if (target.bg === 'green') {
          if (g > r + 15 && g > b + 15) isBackground = true;
          if (r < 30 && b < 30 && g > 20) isBackground = true;
          if (g > 150 && r < 50 && b < 50) isBackground = true;
        }

        if (isBackground) {
          data[i + 3] = 0;
        }
      }

      await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4,
        },
      })
        .resize(128, 128, { kernel: 'nearest' })
        .toFile(outPath);

      console.log(`Processed ${target.out} successfully.`);
    } catch (err) {
      console.error(`Failed on ${target.file}:`, err);
    }
  }
}

removeBackground();
