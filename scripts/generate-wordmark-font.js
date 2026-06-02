import { readFile, writeFile } from 'node:fs/promises';
import { parse } from '../node_modules/three-stdlib/libs/opentype.js';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/generate-wordmark-font.js <input.ttf> <output.json>');
}

const source = await readFile(inputPath);
const font = parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
const characters = [...new Set('Sunder')];

function format(value) {
  return String(Math.round(value));
}

function outlineFor(glyph) {
  return glyph
    .getPath(0, 0, font.unitsPerEm)
    .commands.map((command) => {
      switch (command.type) {
        case 'M':
          return `m ${format(command.x)} ${format(-command.y)}`;
        case 'L':
          return `l ${format(command.x)} ${format(-command.y)}`;
        case 'Q':
          return `q ${format(command.x)} ${format(-command.y)} ${format(command.x1)} ${format(-command.y1)}`;
        case 'C':
          return `b ${format(command.x)} ${format(-command.y)} ${format(command.x1)} ${format(-command.y1)} ${format(command.x2)} ${format(-command.y2)}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');
}

const glyphs = Object.fromEntries(
  characters.map((character) => {
    const glyph = font.charToGlyph(character);

    return [
      character,
      {
        x_min: glyph.xMin,
        x_max: glyph.xMax,
        ha: glyph.advanceWidth,
        o: outlineFor(glyph),
      },
    ];
  }),
);

const typeface = {
  glyphs,
  cssFontWeight: '800',
  ascender: font.ascender,
  underlinePosition: -100,
  cssFontStyle: 'normal',
  boundingBox: {
    yMin: font.descender,
    xMin: Math.min(...Object.values(glyphs).map((glyph) => glyph.x_min)),
    yMax: font.ascender,
    xMax: Math.max(...Object.values(glyphs).map((glyph) => glyph.x_max)),
  },
  resolution: font.unitsPerEm,
  original_font_information: {
    full_font_name: font.names.fullName.en,
    font_family_name: font.names.fontFamily.en,
    subset: 'Sunder wordmark glyphs only',
  },
  descender: font.descender,
  familyName: font.names.fontFamily.en,
  lineHeight: font.ascender - font.descender,
  underlineThickness: 50,
};

await writeFile(outputPath, `${JSON.stringify(typeface)}\n`);
