// Each app in scripts/apps/ exports `name`, `build()`, and an optional
// `contrast()` that returns contrast results like checkContrast().
// To add an app, add its module to `apps`.
import gulp from 'gulp';
import { checkContrast } from './scripts/lib/roles.mjs';
import { preview } from './scripts/preview.mjs';
import * as obsidian from './scripts/apps/obsidian.mjs';
import * as ghostty from './scripts/apps/ghostty.mjs';
import * as vscode from './scripts/apps/vscode.mjs';

const { series, watch: gulpWatch } = gulp;

const apps = [obsidian, ghostty, vscode];

export async function contrast() {
  const results = [checkContrast(), ...apps.map((app) => app.contrast?.() ?? [])].flat();
  const failures = results.filter((r) => !r.pass);
  for (const r of failures) {
    console.error(`  FAIL [${r.mode}] ${r.fg} ${r.fgHex} on ${r.bg} ${r.bgHex}: ${r.ratio.toFixed(2)} < ${r.min}`);
  }
  console.log(`  contrast: ${results.length - failures.length}/${results.length} pairs pass`);
  if (failures.length) throw new Error(`${failures.length} contrast pair(s) fail`);
  return results;
}

const appTasks = apps.map((app) => Object.assign(() => app.build(), { displayName: app.name }));
for (const task of appTasks) gulp.task(`build:${task.displayName}`, series(contrast, task));

export const build = series(contrast, ...appTasks, preview);

export function watch() {
  gulpWatch(['src/**/*', 'manifest.json'], { ignoreInitial: false }, build);
}

export default build;
