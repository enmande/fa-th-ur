import fs from 'node:fs/promises';
import path from 'node:path';
import gulp from 'gulp';
import subsetFont from 'subset-font';
import * as fonts from './src/fonts.mjs';
import { themes } from './src/palette.mjs';
import { checkContrast, variablesCss, previewData, ghosttyTheme } from './scripts/theme-data.mjs';
import { attribution, cssComment, hashComment } from './scripts/attribution.mjs';
import { vscodeThemes, vscodeTheme, themeSlug, checkVscodeContrast } from './scripts/vscode.mjs';
import { createVSIX } from '@vscode/vsce';
import { iconPng, iconSvg } from './scripts/icon.mjs';

const { series, watch: gulpWatch } = gulp;
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const p = (...parts) => path.join(ROOT, ...parts);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const OBSIDIAN_DIST = 'dist/obsidian/fa-th-ur';
const CSS_ORDER = ['base.css', 'typography.css', 'frame.css', 'code.css', 'editor.css', 'callouts.css', 'tables.css'];

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

export async function contrast() {
  const results = [...checkContrast(), ...checkVscodeContrast()];
  const failures = results.filter((r) => !r.pass);
  for (const r of failures) {
    console.error(`  FAIL [${r.mode}] ${r.fg} ${r.fgHex} on ${r.bg} ${r.bgHex}: ${r.ratio.toFixed(2)} < ${r.min}`);
  }
  console.log(`  contrast: ${results.length - failures.length}/${results.length} pairs pass`);
  if (failures.length) throw new Error(`${failures.length} contrast pair(s) fail`);
  return results;
}

async function css() {
  const results = checkContrast();
  const parts = [
    cssComment(attribution('theme for Obsidian', [fonts.mono, fonts.body])),
    await fontFaces(fonts.mono),
    await fontFaces(fonts.body),
    `body {\n  --font-text-theme: "${fonts.body.family}";\n  --font-interface-theme: "${fonts.body.family}";\n  --font-monospace-theme: "${fonts.mono.family}";\n}`,
    variablesCss(),
  ];
  for (const file of CSS_ORDER) parts.push(`/* ${file} */\n${await fs.readFile(p('src/css', file), 'utf8')}`);
  const theme = parts.join('\n\n');

  await fs.mkdir(p(OBSIDIAN_DIST), { recursive: true });
  await fs.writeFile(p(OBSIDIAN_DIST, 'theme.css'), theme);
  await fs.copyFile(p('manifest.json'), p(OBSIDIAN_DIST, 'manifest.json'));
  for (const font of [fonts.mono, fonts.body]) {
    await fs.copyFile(p('src/fonts', font.dir, 'OFL.txt'), p(OBSIDIAN_DIST, `OFL-${font.dir}.txt`));
  }

  const data = previewData(results);
  data.fonts = Object.fromEntries(
    ['body', 'mono'].map((role) => {
      const { family, copyright, unmodified } = fonts[role];
      return [role, { family, copyright, form: unmodified ? 'Embedded unmodified' : 'Embedded as a subset' }];
    }),
  );
  await fs.writeFile(p('preview/build/data.js'), `window.FATHUR = ${JSON.stringify(data, null, 1)};\n`);

  console.log(`  ${OBSIDIAN_DIST}/theme.css: ${kb(Buffer.byteLength(theme))}`);
}

export async function ghostty() {
  await fs.mkdir(p('dist/ghostty'), { recursive: true });
  for (const mode of ['light', 'dark']) {
    const header = hashComment(attribution(`${mode} theme for Ghostty`));
    await fs.writeFile(p('dist/ghostty', `fa-th-ur ${mode}`), `${header}\n\n${ghosttyTheme(mode)}`);
    console.log(`  dist/ghostty/fa-th-ur ${mode}`);
  }
}

export async function vscode() {
  const pkg = JSON.parse(await fs.readFile(p('package.json'), 'utf8'));
  const stage = p('.cache/vscode');
  await fs.rm(stage, { recursive: true, force: true });
  await fs.mkdir(path.join(stage, 'themes'), { recursive: true });

  const contributes = [];
  for (const def of vscodeThemes) {
    const file = `themes/${themeSlug(def)}.json`;
    await fs.writeFile(path.join(stage, file), `${JSON.stringify(vscodeTheme(def), null, 2)}\n`);
    contributes.push({ label: def.label, uiTheme: def.uiTheme, path: `./${file}` });
  }
  const manifest = {
    name: 'fa-th-ur',
    displayName: 'fa-th-ur',
    description: 'Warm, minimal, accessible. Soft blacks, dim ambers, aged paper, and phosphor.',
    version: pkg.version,
    publisher: 'enmande',
    license: 'MIT',
    repository: { type: 'git', url: 'https://github.com/enmande/fa-th-ur' },
    engines: { vscode: '^1.80.0' },
    categories: ['Themes'],
    icon: 'icon.png',
    galleryBanner: { color: themes.dark.swatches.screen, theme: 'dark' },
    files: ['themes/**', 'icon.png', 'README.md', 'LICENSE'],
    contributes: { themes: contributes },
  };
  await fs.writeFile(path.join(stage, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const themeList = vscodeThemes.map((d) => `- ${d.label}`).join('\n');
  await fs.writeFile(
    path.join(stage, 'README.md'),
    `# fa-th-ur\n\n${attribution('themes for VS Code').join('\n\n')}\n\n## Themes\n\n${themeList}\n`,
  );
  await fs.copyFile(p('LICENSE'), path.join(stage, 'LICENSE'));
  await fs.writeFile(path.join(stage, 'icon.png'), iconPng(256));

  await fs.rm(p('dist/vscode'), { recursive: true, force: true });
  await fs.mkdir(p('dist/vscode'), { recursive: true });
  const out = `dist/vscode/fa-th-ur-${pkg.version}.vsix`;
  await createVSIX({ cwd: stage, packagePath: p(out), dependencies: false });
  console.log(`  ${out}: ${vscodeThemes.length} theme(s)`);
}

async function prepare() {
  await fs.mkdir(p('preview/build'), { recursive: true });
  await fs.writeFile(p('preview/build/icon.svg'), iconSvg());
}

async function vault() {
  const config = p('preview/vault/.obsidian');
  const themeDir = path.join(config, 'themes/fa-th-ur');
  await fs.mkdir(themeDir, { recursive: true });
  await fs.copyFile(p(OBSIDIAN_DIST, 'theme.css'), path.join(themeDir, 'theme.css'));
  await fs.copyFile(p(OBSIDIAN_DIST, 'manifest.json'), path.join(themeDir, 'manifest.json'));
  const appearance = path.join(config, 'appearance.json');
  try {
    await fs.access(appearance);
  } catch {
    await fs.writeFile(appearance, `${JSON.stringify({ cssTheme: 'fa-th-ur' }, null, 2)}\n`);
  }
  console.log('  installed theme in preview/vault');
}

export const build = series(prepare, contrast, css, ghostty, vscode, vault);

export function watch() {
  gulpWatch(['src/**/*', 'manifest.json'], { ignoreInitial: false }, series(prepare, contrast, css, ghostty, vscode, vault));
}

export default build;
