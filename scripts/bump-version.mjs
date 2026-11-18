// Usage: npm run version:bump -- <patch|minor|major>
// Sets the next version in package.json, package-lock.json, and manifest.json.
import fs from 'node:fs';

const part = process.argv[2];
const index = ['major', 'minor', 'patch'].indexOf(part);
if (index === -1) {
  console.error('Usage: npm run version:bump -- <patch|minor|major>');
  process.exit(1);
}

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

const pkg = read('package.json');
const manifest = read('manifest.json');
if (pkg.version !== manifest.version) {
  console.error(`package.json has ${pkg.version}, manifest.json has ${manifest.version}. Make them the same first.`);
  process.exit(1);
}

const numbers = pkg.version.split('.').map(Number);
if (numbers.length !== 3 || numbers.some((n) => !Number.isInteger(n) || n < 0)) {
  console.error(`${pkg.version} is not a MAJOR.MINOR.PATCH version.`);
  process.exit(1);
}
numbers[index] += 1;
for (let i = index + 1; i < 3; i++) numbers[i] = 0;
const next = numbers.join('.');

pkg.version = next;
manifest.version = next;
const lock = read('package-lock.json');
lock.version = next;
lock.packages[''].version = next;

write('package.json', pkg);
write('manifest.json', manifest);
write('package-lock.json', lock);
console.log(`${next}: package.json, package-lock.json, manifest.json`);
