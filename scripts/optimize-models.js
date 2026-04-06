import fs from 'fs/promises';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { draco, textureCompress, dedup, prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const RAW_DIR = path.resolve('src/raw-models');
const OUT_DIR = path.resolve('public/models');

async function optimizeModels() {
  console.log('🤖 Agent 2 (Pipeline Engineer): Initializing Model Optimization Pipeline...');
  
  // Ensure directories exist
  await fs.mkdir(RAW_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await fs.readdir(RAW_DIR);
  const glbFiles = files.filter(f => f.endsWith('.glb') || f.endsWith('.gltf'));

  if (glbFiles.length === 0) {
    console.log('✨ No raw models found in src/raw-models/. Skipping pipeline.');
    return;
  }

  // Setup glTF-Transform IO with Draco encoding/decoding and Sharp for textures
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  for (const file of glbFiles) {
    const rawPath = path.join(RAW_DIR, file);
    const outPath = path.join(OUT_DIR, file.replace('.gltf', '.glb')); // Enforce GLB output

    console.log(`\n⏳ Optimizing ${file}...`);
    
    // Read the document
    const document = await io.read(rawPath);

    // Apply optimization pipeline
    await document.transform(
      // Remove unused nodes/materials
      prune(),
      
      // Deduplicate geometries and materials
      dedup(),
      
      // Compress textures into highly efficient WebP/KTX2
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp', // WebP is incredibly fast and highly supported for modern WebGL
        resize: [1024, 1024], // Bound resolution max
      }),
      
      // Apply rigorous Draco mesh compression
      draco({ quantizePositionBits: 14, quantizeTexcoordBits: 12, quantizeNormalBits: 10 })
    );

    // Write back binary GLB
    await io.write(outPath, document);
    
    // Output stats
    const rawStat = await fs.stat(rawPath);
    const outStat = await fs.stat(outPath);
    const rawMb = (rawStat.size / 1024 / 1024).toFixed(2);
    const outMb = (outStat.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - outStat.size / rawStat.size) * 100).toFixed(1);
    
    console.log(`✅ Completed ${file} | ${rawMb}MB -> ${outMb}MB (-${reduction}%)`);
  }
}

optimizeModels().catch(err => {
  console.error('❌ Pipeline Engineer Error:', err);
  process.exit(1);
});
