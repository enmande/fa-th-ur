import { themes, pairs, ghostty, AA, paperSwatches } from '../src/palette.mjs';
import { contrast, hexToRgb, hexToHsl, mix } from './color.mjs';

const HEX = /^#[0-9a-f]{3,8}$/i;
const NAMED_COLORS = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];

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

export function variablesCss() {
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

// The lowest opacity, in steps of 0.05, at which faint foreground text keeps AA contrast.
export function faintOpacity(fg, bg) {
  for (let i = 10; i <= 20; i++) {
    const a = i / 20;
    if (contrast(mix(fg, bg, a), bg) >= AA) return a.toFixed(2);
  }
  throw new Error(`faint text: ${fg} on ${bg} fails AA`);
}

export function ghosttyTheme(mode) {
  const vars = resolveRoles(mode);
  const hex = (role) => {
    if (!HEX.test(vars[role] ?? '')) throw new Error(`[${mode}] ghostty: ${role} must resolve to hex`);
    return vars[role];
  };
  const { palette, ...keys } = ghostty;
  const lines = palette.map((role, i) => `palette = ${i}=${hex(role)}`);
  for (const [key, role] of Object.entries(keys)) lines.push(`${key} = ${hex(role)}`);
  lines.push(`faint-opacity = ${faintOpacity(hex(keys.foreground), hex(keys.background))}`);
  return `${lines.join('\n')}\n`;
}

export function previewData(results) {
  return { themes, paperSwatches, contrast: results };
}
