const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2] || 'packages';
const fileMap = {};

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (!fileMap[file]) fileMap[file] = [];
      fileMap[file].push(fullPath);
    }
  });
}

walk(rootDir);

Object.entries(fileMap).forEach(([file, paths]) => {
  if (paths.length > 1) {
    console.log(`Duplicado: ${file}`);
    paths.forEach(p => console.log(`  - ${p}`));
  }
}); 