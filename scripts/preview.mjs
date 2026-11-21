import fs from 'node:fs/promises';
import path from 'node:path';
import * as fonts from '../src/fonts.mjs';
import { themes, paperSwatches } from '../src/palette.mjs';
import { checkContrast } from './lib/roles.mjs';
import { iconSvg } from './lib/icon.mjs';
import { p } from './lib/paths.mjs';
import { DIST as OBSIDIAN_DIST } from './apps/obsidian.mjs';
import { editorCodeColors } from './apps/vscode.mjs';

// Writes the brief data (preview/build) and installs the Obsidian theme in
// preview/vault. Runs after the app builds.
export async function preview() {
  await fs.mkdir(p('preview/build'), { recursive: true });
  await fs.writeFile(p('preview/build/icon.svg'), iconSvg());

  const data = { themes, paperSwatches, contrast: checkContrast() };
  data.editor = editorCodeColors();
  data.fonts = Object.fromEntries(
    ['body', 'mono'].map((role) => {
      const { family, copyright, unmodified } = fonts[role];
      return [role, { family, copyright, form: unmodified ? 'Embedded unmodified' : 'Embedded as a subset' }];
    }),
  );
  await fs.writeFile(p('preview/build/data.js'), `window.FATHUR = ${JSON.stringify(data, null, 1)};\n`);

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
