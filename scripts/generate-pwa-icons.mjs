/**
 * Generates PWA icon PNGs in public/icons/ using sharp.
 * Brand: gold #ffaa19 on dark #0a0a0a background.
 *
 * Run: node scripts/generate-pwa-icons.mjs
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');

mkdirSync(outDir, { recursive: true });

// Brand colors
const BG = { r: 10, g: 10, b: 10, alpha: 1 };      // #0a0a0a
const GOLD = { r: 255, g: 170, b: 25, alpha: 1 };   // #ffaa19

/**
 * Builds a minimal SVG icon (DDR initials, gold on dark circle) as a Buffer.
 * Sharp will rasterize it to PNG.
 */
function buildSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;
  const fontSize = size * 0.28;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0a0a" stroke="#ffaa19" stroke-width="${size * 0.04}"/>
  <text
    x="${cx}"
    y="${cy + fontSize * 0.35}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="bold"
    font-size="${fontSize}"
    fill="#ffaa19"
    text-anchor="middle"
    dominant-baseline="middle"
  >DDR</text>
</svg>`);
}

const icons = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-512x512.png', size: 512 },
];

for (const { name, size } of icons) {
  const outPath = join(outDir, name);
  await sharp(buildSVG(size))
    .png()
    .toFile(outPath);
  console.log(`Generated ${outPath}`);
}

console.log('Done. Replace icons with final brand assets before production deploy.');
