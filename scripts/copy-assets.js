import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets');

const FILES = [
  'Forte-logo_bg-cream.svg',
  'Forte-logo_bg-plum.svg',
  'CalendarDots.svg',
  'ListStar.svg',
  'Info.svg',
];

mkdirSync(OUTPUT_DIR, { recursive: true });
for (const file of FILES) {
  cpSync(path.join(SOURCE_DIR, file), path.join(OUTPUT_DIR, file));
}
console.log(`Skopiowano ${FILES.length} plik(ów) z assets/ do src/assets/.`);
