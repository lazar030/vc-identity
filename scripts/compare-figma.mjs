import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [figmaPath, actualPath] = process.argv.slice(2);
if (!figmaPath || !actualPath) {
  console.error('Usage: npm run compare:figma -- <figma.png> <screenshot.png>');
  process.exit(1);
}

const figma = PNG.sync.read(fs.readFileSync(figmaPath));
const actual = PNG.sync.read(fs.readFileSync(actualPath));

if (figma.width !== actual.width || figma.height !== actual.height) {
  console.error(
    `Size mismatch: Figma ${figma.width}x${figma.height}, screenshot ${actual.width}x${actual.height}.\n` +
      'Export the Figma frame at 1x and make sure its size matches the viewport used in the test.',
  );
  process.exit(1);
}

const { width, height } = figma;
const diff = new PNG({ width, height });
const changed = pixelmatch(figma.data, actual.data, diff.data, width, height, { threshold: 0.1 });

fs.mkdirSync('evidence/out', { recursive: true });
const outPath = path.join('evidence/out', `diff-${path.basename(actualPath)}`);
fs.writeFileSync(outPath, PNG.sync.write(diff));

const percent = ((changed / (width * height)) * 100).toFixed(2);
console.log(`${changed} pixels differ (${percent}%). Diff image: ${outPath}`);
