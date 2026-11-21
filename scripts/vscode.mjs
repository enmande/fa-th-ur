import { themes } from '../src/palette.mjs';
import { chromeColors, surfaces, vscodeThemes, vscodePairs } from '../src/vscode.mjs';
import { resolveRoles } from './theme-data.mjs';
import { contrast, mix } from './color.mjs';

const HEX = /^#[0-9a-f]{6}$/i;
const HEX_ALPHA = /^#[0-9a-f]{8}$/i;

function resolver(mode, overrides = {}) {
  const roles = resolveRoles(mode);
  const { swatches } = themes[mode];
  const one = (input) => {
    const value = overrides[input] ?? input;
    const hex = value.startsWith('--') ? roles[value] : value in swatches ? swatches[value] : value;
    if (!HEX.test(hex ?? '')) throw new Error(`[vscode ${mode}] "${value}" must resolve to a 6-digit hex color`);
    return hex;
  };
  const resolve = (value) => {
    if (Array.isArray(value)) return `${resolve(value[0])}${value[1]}`;
    if (typeof value === 'object') return resolve(value[mode]);
    return one(value);
  };
  return resolve;
}

function resolveMap(map, mode, overrides) {
  const resolve = resolver(mode, overrides);
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [key, resolve(value)]));
}

export const themeSlug = (def) => def.label.replace(/\s+/g, '-');

export function vscodeTheme(def) {
  const surface = surfaces[def.surface];
  if (!surface) throw new Error(`${def.label}: unknown surface "${def.surface}"`);
  const resolve = resolver(surface.mode, surface.roles);
  return {
    name: def.label,
    type: def.uiTheme === 'vs' ? 'light' : 'dark',
    semanticHighlighting: true,
    colors: { ...resolveMap(chromeColors, def.chrome), ...resolveMap(surface.colors, surface.mode, surface.roles) },
    tokenColors: surface.tokens.map(({ role, fontStyle, scope }) => ({
      scope,
      settings: { foreground: resolve(role), ...(fontStyle !== undefined && { fontStyle }) },
    })),
  };
}

function opaque(color, base) {
  if (HEX.test(color)) return color;
  if (!HEX_ALPHA.test(color) || !HEX.test(base ?? '')) throw new Error(`cannot flatten ${color} on ${base}`);
  return mix(color.slice(0, 7), base, parseInt(color.slice(7), 16) / 255);
}

export function checkVscodeContrast() {
  const results = [];
  for (const def of vscodeThemes) {
    const theme = vscodeTheme(def);
    const surface = surfaces[def.surface];
    const resolve = resolver(surface.mode, surface.roles);
    const tokens = Object.fromEntries(surface.tokens.map(({ role }) => [`token:${role}`, resolve(role)]));
    const colors = { ...theme.colors, ...tokens };
    for (const [fg, bg, min, base] of vscodePairs) {
      const bgHex = opaque(colors[bg], colors[base]);
      const ratio = contrast(opaque(colors[fg]), bgHex);
      results.push({ mode: def.label, fg, bg, fgHex: colors[fg], bgHex, min, ratio, pass: ratio >= min });
    }
  }
  return results;
}


// The editor colors of each VS Code theme, by its chrome mode, for the brief:
// each --code-* role, plus the editor background and border.
export function editorCodeColors() {
  return Object.fromEntries(
    vscodeThemes.map((def) => {
      const surface = surfaces[def.surface];
      const resolve = resolver(surface.mode, surface.roles);
      const { colors } = vscodeTheme(def);
      const roles = Object.fromEntries(surface.tokens.map(({ role }) => [role, resolve(role)]).filter(([role]) => role.startsWith('--code-')));
      return [def.chrome, {
        label: def.label,
        ...roles,
        '--code-background': colors['editor.background'],
        '--code-border-color': colors['editorRuler.foreground'],
      }];
    }),
  );
}

export { vscodeThemes };
