/**
 * Techastra 2026 — Code Rescue Dist Deployment Utility
 * Copies the compiled Vite distribution bundle from coderescue/dist to:
 * - static/coderescue
 * - static/os/coderescue
 * - public/coderescue
 * - public/os/coderescue
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'coderescue', 'dist');

const targetDirs = [
  path.join(rootDir, 'static', 'coderescue'),
  path.join(rootDir, 'static', 'os', 'coderescue'),
  path.join(rootDir, 'public', 'coderescue'),
  path.join(rootDir, 'public', 'os', 'coderescue')
];

if (!fs.existsSync(srcDir)) {
  console.error(`[Error] coderescue/dist does not exist at ${srcDir}. Please run "npm --prefix coderescue run build" first.`);
  process.exit(1);
}

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

function cleanAssets(dir) {
  const assetsDir = path.join(dir, 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }
}

targetDirs.forEach(target => {
  cleanAssets(target);
  copyFolderRecursiveSync(srcDir, target);
  console.log(`[Deploy] Synchronized dist to ${path.relative(rootDir, target)}`);
});

console.log('[Deploy] Code Rescue distribution deployment complete.');
