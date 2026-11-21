import fs from 'node:fs/promises';
import path from 'node:path';
import subsetFont from 'subset-font';
import * as fonts from '../../src/fonts.mjs';
import { themes } from '../../src/palette.mjs';
import { resolveRoles } from '../lib/roles.mjs';
import { hexToRgb, hexToHsl } from '../lib/color.mjs';
import { attribution, cssComment } from '../lib/attribution.mjs';
import { p, kb } from '../lib/paths.mjs';

export const name = 'obsidian';
export const DIST = 'dist/obsidian/fa-th-ur';

const CSS_DIR = 'src/apps/obsidian';
const CSS_ORDER = ['base.css', 'typography.css', 'frame.css', 'code.css', 'editor.css', 'callouts.css', 'tables.css'];
const NAMED_COLORS = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];

async function fresh(target, sources) {
  try {
    const t = (await fs.stat(target)).mtimeMs;
    for (const s of sources) if ((await fs.stat(s)).mtimeMs > t) return false;
    return true;
  } catch {
    return false;
  }
}

async function subsetOne(font, style) {
  const src = p('src/fonts', font.dir, font.files[style]);
  const out = p('.cache/fonts', `${font.dir}-${style}.woff2`);
  if (!(await fresh(out, [src, p('src/fonts.mjs')]))) {
    const woff2 = await subsetFont(await fs.readFile(src), font.text, {
      targetFormat: 'woff2',
      variationAxes: font.axes,
    });
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, woff2);
  }
  return fs.readFile(out);
}

async function fontFaces(font) {
  const [mime, format] = font.unmodified ? ['font/ttf', 'truetype'] : ['font/woff2', 'woff2'];
  const { wght, wdth } = font.axes;
  const blocks = [];
  for (const style of Object.keys(font.files)) {
    const data = font.unmodified
      ? await fs.readFile(p('src/fonts', font.dir, font.files[style]))
      : await subsetOne(font, style);
    console.log(`  ${font.family} ${style}: ${kb(data.length)} ${format}, ${kb(Math.ceil(data.length / 3) * 4)} base64`);
    blocks.push(
      `@font-face {\n  font-family: "${font.family}";\n  font-style: ${style};\n` +
        `  font-weight: ${wght.min} ${wght.max};\n` +
        (wdth?.min !== undefined ? `  font-stretch: ${wdth.min}% ${wdth.max}%;\n` : '') +
        `  font-display: swap;\n` +
        `  src: url(data:${mime};base64,${data.toString('base64')}) format("${format}");\n}`,
    );
  }
  return blocks.join('\n');
}

function variablesCss() {
  const blocks = [];
  for (const mode of Object.keys(themes)) {
    const vars = resolveRoles(mode);
    const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
    for (const c of NAMED_COLORS) lines.push(`  --color-${c}-rgb: ${hexToRgb(vars[`--color-${c}`]).join(', ')};`);
    const [h, s, l] = hexToHsl(vars['--color-accent']);
    lines.push(`  --accent-h: ${h.toFixed(1)};`, `  --accent-s: ${s.toFixed(1)}%;`, `  --accent-l: ${l.toFixed(1)}%;`);
    blocks.push(`.theme-${mode} {\n${lines.join('\n')}\n}`);
  }
  return `/* Generated from src/palette.mjs. */\n${blocks.join('\n\n')}\n`;
}

export async function build() {
  const parts = [
    cssComment(attribution('theme for Obsidian', [fonts.mono, fonts.body])),
    await fontFaces(fonts.mono),
    await fontFaces(fonts.body),
    `body {\n  --font-text-theme: "${fonts.body.family}";\n  --font-interface-theme: "${fonts.body.family}";\n  --font-monospace-theme: "${fonts.mono.family}";\n}`,
    variablesCss(),
  ];
  for (const file of CSS_ORDER) parts.push(`/* ${file} */\n${await fs.readFile(p(CSS_DIR, file), 'utf8')}`);
  const theme = parts.join('\n\n');

  await fs.mkdir(p(DIST), { recursive: true });
  await fs.writeFile(p(DIST, 'theme.css'), theme);
  await fs.copyFile(p('manifest.json'), p(DIST, 'manifest.json'));
  for (const font of [fonts.mono, fonts.body]) {
    await fs.copyFile(p('src/fonts', font.dir, 'OFL.txt'), p(DIST, `OFL-${font.dir}.txt`));
  }
  console.log(`  ${DIST}/theme.css: ${kb(Buffer.byteLength(theme))}`);
}
