const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../react-bits-repo/src/tailwind/TextAnimations');
const destDir = path.join(__dirname, 'src/components');

function copyAndTransform(source, destination) {
  if (fs.statSync(source).isDirectory()) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    const files = fs.readdirSync(source);
    files.forEach(file => {
      copyAndTransform(path.join(source, file), path.join(destination, file));
    });
  } else if (source.endsWith('.jsx') || source.endsWith('.css') || source.endsWith('.js')) {
    let content = fs.readFileSync(source, 'utf8');
    
    // Transform framer-motion imports
    content = content.replace(/from\s+['"]motion\/react['"]/g, "from 'framer-motion'");
    content = content.replace(/from\s+['"]motion\/react-client['"]/g, "from 'framer-motion'");
    
    fs.writeFileSync(destination, content, 'utf8');
    console.log(`Copied and transformed: ${path.basename(destination)}`);
  }
}

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory not found: ${srcDir}`);
  process.exit(1);
}

const folders = fs.readdirSync(srcDir);
folders.forEach(folder => {
  const folderPath = path.join(srcDir, folder);
  if (fs.statSync(folderPath).isDirectory()) {
    // Copy contents of folder directly into src/components (not creating a subfolder per component)
    // Actually, it's safer to just copy the .jsx files since React Bits usually has 1 component per folder.
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js')) {
         copyAndTransform(path.join(folderPath, file), path.join(destDir, file));
      }
    });
  }
});

console.log('All animations copied successfully!');
