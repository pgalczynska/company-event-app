import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Wariant z jasnym (cream) logotypem, przeznaczony do użycia na ciemnym tle — stąd "bg-plum".
const SOURCE_SVG = path.join(__dirname, '..', 'assets', 'Forte-logo_bg-plum.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'icons');

const PLUM = '#39344b';
// Margines wokół logotypu — m.in. żeby maskowalne ikony na Androidzie (koło/squircle) nie ucinały treści.
const SAFE_ZONE_RATIO = 0.72;

const TARGETS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { file, size } of TARGETS) {
  const innerSize = Math.round(size * SAFE_ZONE_RATIO);

  // Renderujemy logo z zachowaną przezroczystością, a potem nakładamy je na w pełni
  // opaczne tło — sharp's .flatten() w tym pipeline (SVG -> resize) psuje cały obraz
  // (zamienia go w jednolity kolor), więc zamiast tego używamy .composite().
  const logo = await sharp(SOURCE_SVG, { density: 384 })
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: PLUM } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(OUTPUT_DIR, file));
}

console.log(`Wygenerowano ${TARGETS.length} ikon(y) w src/assets/icons/.`);
