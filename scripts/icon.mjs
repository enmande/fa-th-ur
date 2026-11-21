import { Resvg } from '@resvg/resvg-js';
import { themes } from '../src/palette.mjs';
import { mix } from './color.mjs';

// Sunset stripes on the code screen. The bars get shorter and thinner toward
// the bottom, so their left edge makes an "F". Each bar has its own color, in
// even steps from amber to phosphor.
const LENGTHS = [66, 66, 48, 48, 22, 22, 22];

export function iconSvg() {
  const { screen, screenLine, amber, phosphor } = themes.dark.swatches;
  const n = LENGTHS.length;
  const [top, bottom, left, gap] = [24, 104, 31, 4];
  const weights = LENGTHS.map((_, i) => 13 - (6 * i) / (n - 1));
  const scale = (bottom - top - gap * (n - 1)) / weights.reduce((a, b) => a + b);
  let y = top;
  const bars = LENGTHS.map((width, i) => {
    const height = weights[i] * scale;
    const bar = `<rect x="${left}" y="${y.toFixed(2)}" width="${width}" height="${height.toFixed(2)}" fill="${mix(phosphor, amber, i / (n - 1))}"/>`;
    y += height + gap;
    return bar;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect x="2" y="2" width="124" height="124" rx="26" fill="${screen}" stroke="${screenLine}" stroke-width="4"/>
  ${bars.join('\n  ')}
</svg>
`;
}

export function iconPng(size = 256) {
  return new Resvg(iconSvg(), { fitTo: { mode: 'width', value: size } }).render().asPng();
}
