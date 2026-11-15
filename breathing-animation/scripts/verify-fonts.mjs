#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const fontDirs = [
  'docs/assets/fonts',
  'frontend/vanilla-js/public/assets/fonts',
  'frontend/vanilla-js/src/assets/fonts'
];

const cssFiles = [
  'docs/styles/styles.css',
  'frontend/vanilla-js/src/styles/styles.css'
];

const requiredFiles = [
  'pocketgull-regular.woff2',
  'pocketgull-bold.woff2',
  'pocketgull-slab-bold.woff2',
  'pocketgull-mono.woff2',
  'LICENSE-FONTS.txt'
];

const bannedFiles = [
  'pocketgull-fineliner.woff2',
  'pocketgull-chiseltip.woff2'
];

let errors = 0;

for (const relDir of fontDirs) {
  const dir = path.join(rootDir, relDir);
  if (!fs.existsSync(dir)) {
    console.error(`[FONT-GUARD] Missing font directory: ${relDir}`);
    errors++;
    continue;
  }

  for (const banned of bannedFiles) {
    if (fs.existsSync(path.join(dir, banned))) {
      console.error(`[FONT-GUARD] Banned legacy marker font present: ${relDir}/${banned}`);
      errors++;
    }
  }

  for (const req of requiredFiles) {
    const fullPath = path.join(dir, req);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FONT-GUARD] Missing required canonical font file: ${relDir}/${req}`);
      errors++;
      continue;
    }

    if (req.endsWith('.woff2')) {
      const buf = fs.readFileSync(fullPath);
      if (buf.subarray(0, 4).toString('ascii') !== 'wOF2') {
        console.error(`[FONT-GUARD] Invalid WOFF2 magic header in ${relDir}/${req}`);
        errors++;
      }
      if (buf.length < 30_000) {
        console.error(
          `[FONT-GUARD] Font binary too small (${buf.length} bytes < 30 KB) in ${relDir}/${req} — broken <1,000-glyph prototype suspected.`
        );
        errors++;
      }
      const ascii = buf.toString('latin1');
      if (/Font Diner|Version 1\.001|Version 2\.000/i.test(ascii)) {
        console.error(`[FONT-GUARD] Banned legacy prototype metadata detected in ${relDir}/${req}`);
        errors++;
      }
    }
  }
}

for (const relCss of cssFiles) {
  const fullCss = path.join(rootDir, relCss);
  const css = fs.readFileSync(fullCss, 'utf8');
  if (/fineliner|chiseltip/i.test(css)) {
    console.error(`[FONT-GUARD] Banned marker variant (fineliner/chiseltip) referenced in ${relCss}`);
    errors++;
  }
  if (!css.includes('pocketgull-regular.woff2') || !css.includes('pocketgull-mono.woff2')) {
    console.error(`[FONT-GUARD] Canonical pocketgull-regular / pocketgull-mono @font-face missing in ${relCss}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`❌ PocketGull font provenance check failed with ${errors} error(s).`);
  process.exit(1);
}

console.log('✅ PocketGull font provenance verified (v3.100+ WOFF2 binaries & CSS @font-face clean).');
