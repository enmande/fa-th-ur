import { themes, pairs } from '../../src/palette.mjs';
import { contrast } from './color.mjs';

export const HEX = /^#[0-9a-f]{3,8}$/i;

export function resolveRoles(mode) {
  const { swatches, roles } = themes[mode];
  const out = {};
  for (const [name, value] of Object.entries(roles)) {
    if (value in swatches) out[name] = swatches[value];
    else if (HEX.test(value) || !/^[a-zA-Z0-9]+$/.test(value) || value === 'transparent') out[name] = value;
    else throw new Error(`[${mode}] ${name}: unknown swatch "${value}"`);
  }
  return out;
}

export function checkContrast() {
  const results = [];
  for (const mode of Object.keys(themes)) {
    const vars = resolveRoles(mode);
    for (const [fg, bg, min] of pairs) {
      if (!HEX.test(vars[fg] ?? '') || !HEX.test(vars[bg] ?? '')) {
        throw new Error(`[${mode}] pair ${fg} on ${bg}: both roles must resolve to hex`);
      }
      const ratio = contrast(vars[fg], vars[bg]);
      results.push({ mode, fg, bg, fgHex: vars[fg], bgHex: vars[bg], min, ratio, pass: ratio >= min });
    }
  }
  return results;
}
