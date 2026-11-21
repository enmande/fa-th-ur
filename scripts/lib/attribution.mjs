const PROJECT = 'fa-th-ur';
const URL = 'https://github.com/enmande/fa-th-ur';
const COPYRIGHT = 'Copyright (c) 2026 Dave';

export function attribution(product, embeddedFonts = []) {
  const lines = [`${PROJECT} ${product}. ${COPYRIGHT}. MIT License.`, URL];
  if (embeddedFonts.length) {
    lines.push('Embedded fonts, under the SIL Open Font License 1.1 (https://openfontlicense.org):');
    for (const f of embeddedFonts) lines.push(`  ${f.family} (${f.unmodified ? 'unmodified' : 'subset'}): ${f.copyright}`);
    lines.push(`Font license details: ${URL}/blob/main/LICENSE-FONTS.md`);
  }
  return lines;
}

export const cssComment = (lines) => `/*\n${lines.map((l) => ` * ${l}`).join('\n')}\n */`;
export const hashComment = (lines) => lines.map((l) => `# ${l}`).join('\n');
