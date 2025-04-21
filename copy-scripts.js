// copy-scripts.js
import fs from 'fs';
import path from 'path';

const srcFiles = ['index.html', 'styles.css', 'manifest.json', 'app.js', 'firebase-config.js', 'config.js'];
const jsDir = path.resolve('./js');
const publicDir = path.resolve('./public');
const publicJS = path.join(publicDir, 'js');

// Ensure directories exist
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(publicJS)) fs.mkdirSync(publicJS, { recursive: true });

// Copy root-level frontend files
srcFiles.forEach(file => {
  const from = path.resolve(file);
  const to = path.join(publicDir, file);
  fs.copyFileSync(from, to);
  console.log(`✔ Copied ${file} → /public`);
});

// Copy JS modules into /public/js
fs.readdirSync(jsDir).forEach(file => {
  const srcFile = path.join(jsDir, file);
  const destFile = path.join(publicJS, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`✔ Copied ${file} → /public/js`);
});
