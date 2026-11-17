// Font roles for the theme. `mono` and `body` go into
// dist/obsidian/fa-th-ur/theme.css.
// `unmodified: true` embeds the source file as-is. Use it for a font with a
// Reserved Font Name: OFL 1.1 forbids that name on a subset or instanced copy.

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');

export const textSubset = [
  range(0x20, 0x7e), // Basic Latin
  range(0xa0, 0xff), // Latin-1 Supplement
  range(0x100, 0x17f), // Latin Extended-A
  range(0x2010, 0x205e), // General Punctuation
  '€™←↑→↓↔↵✓✗…',
].join('');

export const monoSubset = [
  textSubset,
  range(0x2190, 0x21ff), // Arrows
  range(0x2500, 0x259f), // Box Drawing, Block Elements
  range(0x25a0, 0x25ff), // Geometric Shapes
].join('');

const weights = { wght: { min: 400, max: 700 } };

export const mono = {
  family: 'JetBrains Mono',
  copyright: 'Copyright 2020 The JetBrains Mono Project Authors',
  dir: 'jetbrains-mono',
  files: { normal: 'JetBrainsMono[wght].ttf', italic: 'JetBrainsMono-Italic[wght].ttf' },
  axes: weights,
  text: monoSubset,
};

export const body = {
  family: 'IBM Plex Sans',
  copyright: 'Copyright 2017 IBM Corp. with Reserved Font Name "Plex"',
  dir: 'ibm-plex-sans',
  files: { normal: 'IBMPlexSans[wdth,wght].ttf', italic: 'IBMPlexSans-Italic[wdth,wght].ttf' },
  axes: { wght: { min: 100, max: 700 }, wdth: { min: 75, max: 100 } },
  unmodified: true,
};
