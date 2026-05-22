import sharp from 'sharp';

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/silo-clippy.js <input-image> <output-png>');
  process.exit(1);
}

async function siloClippy() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > 230 && g > 230 && b > 230) {
      data[i + 3] = 0;
    } else if (r > 200 && g > 200 && b > 200) {
      const brightness = (r + g + b) / 3;
      const alpha = Math.round(255 * (1 - (brightness - 200) / 30));
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  console.log(`Image isolated to ${outputPath} (${info.width}x${info.height})`);
}

siloClippy().catch(err => {
  console.error('Image isolation failed:', err);
  process.exit(1);
});
