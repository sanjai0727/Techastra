/**
 * Techastra 2026 — Admin Portal Deployment Utility
 * Synchronizes static/admin files (bundle, html, assets) to public/admin
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'static', 'admin');
const targetDir = path.join(rootDir, 'public', 'admin');

if (!fs.existsSync(srcDir)) {
  console.error(`[Error] static/admin does not exist at ${srcDir}`);
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
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

copyFolderRecursiveSync(srcDir, targetDir);
console.log(`[Deploy] Synchronized static/admin -> public/admin complete.`);
