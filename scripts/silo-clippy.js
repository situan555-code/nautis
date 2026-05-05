import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputPath = '/Volumes/raid4/Antigravity IDE/Resume Website/resume assets/use/Gemini_Generated_Image_w8vx2bw8vx2bw8vx.jpeg';
const outputPath = '/Volumes/raid4/Antigravity IDE/Resume Website/public/clippy.png';

async function siloClippy() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // White and near-white background removal
    // If all channels are above 230, it's white background
    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0; // fully transparent
    }
    // Soft edge: if all channels are above 200, fade proportionally
    else if (r > 200 && g > 200 && b > 200) {
      const brightness = (r + g + b) / 3;
      // Map 200-230 range to partial transparency for smooth edges
      const alpha = Math.round(255 * (1 - (brightness - 200) / 30));
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
  .png()
  .toFile(outputPath);

  console.log(`✅ Clippy siloed out to ${outputPath} (${info.width}x${info.height})`);
}

siloClippy().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
