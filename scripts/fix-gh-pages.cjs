const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

if (!fs.existsSync(outDir)) {
  console.error(`Directory ${outDir} does not exist. Run "npm run build" first.`);
  process.exit(1);
}

// 1. Rename _next directory to assets (so Jekyll never blocks it even without .nojekyll)
const oldNextDir = path.join(outDir, '_next');
const newAssetsDir = path.join(outDir, 'assets');

if (fs.existsSync(newAssetsDir)) {
  fs.rmSync(newAssetsDir, { recursive: true, force: true });
}

if (fs.existsSync(oldNextDir)) {
  fs.renameSync(oldNextDir, newAssetsDir);
  console.log('✓ Renamed _next -> assets to bypass Jekyll underscore blocking');
}

// 2. Also keep .nojekyll just in case
fs.writeFileSync(path.join(outDir, '.nojekyll'), '# Disable Jekyll\n', 'utf8');

// 3. Patch all HTML, JS, CSS, JSON files recursively
function patchAllFiles(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      patchAllFiles(fullPath);
    } else {
      const ext = path.extname(entry).toLowerCase();
      if (['.html', '.js', '.json', '.css', '.txt'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Replace all references of _next with assets and make paths relative
        if (content.includes('/_next/') || content.includes('_next/')) {
          content = content.replace(/href="\/_next\//g, 'href="./assets/');
          content = content.replace(/src="\/_next\//g, 'src="./assets/');
          content = content.replace(/href="\.\/_next\//g, 'href="./assets/');
          content = content.replace(/src="\.\/_next\//g, 'src="./assets/');
          content = content.replace(/"\/_next\//g, '"./assets/');
          content = content.replace(/"\.\/_next\//g, '"./assets/');
          content = content.replace(/_next\//g, 'assets/');
          modified = true;
        }

        if (content.includes('href="/images/') || content.includes('src="/images/')) {
          content = content.replace(/href="\/images\//g, 'href="./images/');
          content = content.replace(/src="\/images\//g, 'src="./images/');
          modified = true;
        }

        // Webpack publicPath fix
        if (ext === '.js') {
          if (content.includes('__webpack_require__.p="/"') || content.includes('__webpack_require__.p = "/"')) {
            content = content.replace(/__webpack_require__\.p\s*=\s*"\/";?/g, '__webpack_require__.p="";');
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✓ Patched: ${path.relative(outDir, fullPath)}`);
        }
      }
    }
  }
}

patchAllFiles(outDir);
console.log('✓ Successfully converted all files to standard "assets/" directory with relative paths!');
