// Build script for LegalLens AI Chrome Extension
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Create public directory in dist
const distPublicDir = path.join(distDir, 'public');
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir);
}

// Copy SVG icons to PNG files in dist/public
console.log('Processing icon files...');
const iconSizes = [16, 48, 128];

// For this build script, we'll use a simple approach of copying SVG files
// In a production environment, you should use a library like 'sharp' to convert SVG to PNG
// Install sharp with: npm install sharp
iconSizes.forEach(size => {
  const svgPath = path.join(__dirname, 'public', `icon${size}.svg`);
  const pngPath = path.join(distPublicDir, `icon${size}.png`);
  
  if (fs.existsSync(svgPath)) {
    try {
      // Copy SVG file to PNG for now
      // In a real implementation, use:
      // import sharp from 'sharp';
      // sharp(svgPath).png().resize(size, size).toFile(pngPath);
      fs.copyFileSync(svgPath, pngPath);
      console.log(`Processed icon${size}.svg to dist/public/icon${size}.png`);
    } catch (error) {
      console.error(`Error processing icon${size}.svg:`, error);
    }
  } else {
    console.error(`Warning: icon${size}.svg does not exist`);
  }
});

// Copy necessary files to dist
console.log('Copying files to dist directory...');

// Files to copy
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'background.js',
  'content.js',
  'privacy-policy.html',
  'settings.html',
  'settings.js'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(
      path.join(__dirname, file),
      path.join(distDir, file)
    );
    console.log(`Copied ${file} to dist`);
  } else {
    console.error(`Warning: ${file} does not exist`);
  }
});

// Create src directory in dist
const distSrcDir = path.join(distDir, 'src');
if (!fs.existsSync(distSrcDir)) {
  fs.mkdirSync(distSrcDir);
}

// Create api directory in dist/src
const distApiDir = path.join(distSrcDir, 'api');
if (!fs.existsSync(distApiDir)) {
  fs.mkdirSync(distApiDir);
}

// Copy API files
const apiFiles = ['analyse.js', 'assistant.js'];
apiFiles.forEach(file => {
  const srcPath = path.join(__dirname, 'src', 'api', file);
  const destPath = path.join(distApiDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied src/api/${file} to dist/src/api`);
  } else {
    console.error(`Warning: src/api/${file} does not exist`);
  }
});

// Create a version file with build timestamp
const versionInfo = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  environment: 'production'
};
fs.writeFileSync(
  path.join(distDir, 'version.json'), 
  JSON.stringify(versionInfo, null, 2)
);
console.log('Created version.json file in dist');

console.log('Build completed successfully!');
console.log('To load the extension in Chrome:');
console.log('1. Open Chrome and navigate to chrome://extensions');
console.log('2. Enable "Developer mode" (toggle in the top right)');
console.log('3. Click "Load unpacked" and select the dist directory'); 