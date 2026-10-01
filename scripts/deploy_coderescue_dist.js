const fs = require('fs');
const path = require('path');

const srcDir = 'E:/projects/techastra-coderescue/dist';
const targetDirs = [
  'E:/projects/techastra/static/coderescue',
  'E:/projects/techastra/static/os/coderescue',
  'E:/projects/techastra/public/coderescue',
  'E:/projects/techastra/public/os/coderescue'
];

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
  console.log(`Copied dist to ${target}`);
});

console.log('Successfully deployed all CodeRescue dist assets!');
