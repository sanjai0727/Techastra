/**
 * Techastra 2026 — Desktop OS Dist Deployment Utility
 * Copies the compiled React distribution bundle from os/build to:
 * - static/os
 * - public/os
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'os', 'build');

const targetDirs = [
  path.join(rootDir, 'static', 'os'),
  path.join(rootDir, 'public', 'os')
];

if (!fs.existsSync(srcDir)) {
  console.error(`[Error] os/build does not exist at ${srcDir}. Please run "npm --prefix os run build" first.`);
  process.exit(1);
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    // Preserve existing coderescue subdirectory in static/os and public/os
    if (file === 'coderescue') return;

    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

targetDirs.forEach(target => {
  copyFolderRecursiveSync(srcDir, target);
  console.log(`[Deploy] Synchronized os build to ${path.relative(rootDir, target)}`);
});

console.log('[Deploy] Desktop OS deployment complete.');
