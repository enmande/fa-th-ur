import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
export const p = (...parts) => path.join(ROOT, ...parts);
export const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
