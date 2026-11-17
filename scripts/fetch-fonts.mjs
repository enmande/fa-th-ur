import fs from 'node:fs/promises';
import path from 'node:path';

const GF = 'https://raw.githubusercontent.com/google/fonts/main/ofl';
const JB = 'https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master';

const sources = {
  'jetbrains-mono': [
    `${JB}/fonts/variable/JetBrainsMono%5Bwght%5D.ttf`,
    `${JB}/fonts/variable/JetBrainsMono-Italic%5Bwght%5D.ttf`,
    `${JB}/OFL.txt`,
  ],
  'ibm-plex-sans': [
    `${GF}/ibmplexsans/IBMPlexSans%5Bwdth,wght%5D.ttf`,
    `${GF}/ibmplexsans/IBMPlexSans-Italic%5Bwdth,wght%5D.ttf`,
    `${GF}/ibmplexsans/OFL.txt`,
  ],
};

const root = path.resolve('src/fonts');
for (const [family, urls] of Object.entries(sources)) {
  const dir = path.join(root, family);
  await fs.mkdir(dir, { recursive: true });
  for (const url of urls) {
    const name = decodeURIComponent(path.basename(url));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(path.join(dir, name), buf);
    console.log(`${family}/${name}\t${(buf.length / 1024).toFixed(0)} KB`);
  }
}
