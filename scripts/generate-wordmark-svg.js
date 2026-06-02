import { readFile, writeFile } from 'node:fs/promises';
import { parse } from '../node_modules/three-stdlib/libs/opentype.js';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/generate-wordmark-svg.js <input.ttf> <output.svg>');
}

const source = await readFile(inputPath);
const font = parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
const wordmark = 'Sunder';
const period = '.';
const periodSourceOffsetY = -160;
const periodPositionX = font.getAdvanceWidth(wordmark, font.unitsPerEm);
const width = Math.ceil(font.getAdvanceWidth(`${wordmark}${period}`, font.unitsPerEm));
const height = font.ascender - font.descender;
const wordmarkPath = font.getPath(wordmark, 0, font.ascender, font.unitsPerEm);
const periodPath = font.getPath(period, periodPositionX, font.ascender + periodSourceOffsetY, font.unitsPerEm);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <path d="${wordmarkPath.toPathData(2)}" fill="#000000" />
  <path d="${periodPath.toPathData(2)}" fill="#000000" />
</svg>
`;

await writeFile(outputPath, svg);
