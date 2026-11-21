import fs from 'node:fs/promises';
import { AA, ansi } from '../../src/palette.mjs';
import { keys } from '../../src/apps/ghostty.mjs';
import { HEX, resolveRoles } from '../lib/roles.mjs';
import { contrast, mix } from '../lib/color.mjs';
import { attribution, hashComment } from '../lib/attribution.mjs';
import { p } from '../lib/paths.mjs';

export const name = 'ghostty';

// The lowest opacity, in steps of 0.05, at which faint foreground text keeps AA contrast.
function faintOpacity(fg, bg) {
  for (let i = 10; i <= 20; i++) {
    const a = i / 20;
    if (contrast(mix(fg, bg, a), bg) >= AA) return a.toFixed(2);
  }
  throw new Error(`faint text: ${fg} on ${bg} fails AA`);
}

function theme(mode) {
  const vars = resolveRoles(mode);
  const hex = (role) => {
    if (!HEX.test(vars[role] ?? '')) throw new Error(`[${mode}] ghostty: ${role} must resolve to hex`);
    return vars[role];
  };
  const lines = ansi.map((role, i) => `palette = ${i}=${hex(role)}`);
  for (const [key, role] of Object.entries(keys)) lines.push(`${key} = ${hex(role)}`);
  lines.push(`faint-opacity = ${faintOpacity(hex(keys.foreground), hex(keys.background))}`);
  return `${lines.join('\n')}\n`;
}

export async function build() {
  await fs.mkdir(p('dist/ghostty'), { recursive: true });
  for (const mode of ['light', 'dark']) {
    const header = hashComment(attribution(`${mode} theme for Ghostty`));
    await fs.writeFile(p('dist/ghostty', `fa-th-ur ${mode}`), `${header}\n\n${theme(mode)}`);
    console.log(`  dist/ghostty/fa-th-ur ${mode}`);
  }
}
