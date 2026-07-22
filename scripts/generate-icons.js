import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_SVG = path.join(__dirname, '..', 'assets', 'Forte-logo_bg-cream.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'icons');

const PLUM = '#39344b';

const TARGETS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { file, size } of TARGETS) {
  await sharp(SOURCE_SVG, { density: 384 })
    .resize(size, size, { fit: 'contain', background: PLUM })
    .png()
    .toFile(path.join(OUTPUT_DIR, file));
}

console.log(`Wygenerowano ${TARGETS.length} ikon(y) w src/assets/icons/.`);
