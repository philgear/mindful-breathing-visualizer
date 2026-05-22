const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const rootReadmePath = path.join(rootDir, 'README.md');

// 1. Define the Standard Preamble (derived from ecosystem values)
const getPreamble = (pillarName) => `<!-- PREAMBLE_START -->
> 🌿 **${pillarName} Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
> *   **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> *   **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> *   **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.
<!-- PREAMBLE_END -->

`;

// 2. Recursive function to find READMEs
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory && f !== 'node_modules' && f !== '.git' && f !== 'dist') {
      walkDir(dirPath, callback);
    } else if (f === 'README.md') {
      callback(dirPath);
    }
  });
}

// 3. Main execution
console.log('Syncing Pillar READMEs...');
const mainReadme = fs.readFileSync(rootReadmePath, 'utf8');

walkDir(rootDir, (filePath) => {
  // Skip the root README itself
  if (path.resolve(filePath) === path.resolve(rootReadmePath)) return;
  if (filePath.includes('node_modules')) return;

  // Determine Pillar Name from parent directory
  const parentDir = path.basename(path.dirname(filePath));
  const grandParentDir = path.basename(path.dirname(path.dirname(filePath)));

  // Nice formatting for pillar name (e.g., "Math / C" or "CLI / Python")
  let pillarName =
    grandParentDir === 'breathing-animation'
      ? parentDir.charAt(0).toUpperCase() + parentDir.slice(1)
      : `${grandParentDir.charAt(0).toUpperCase() + grandParentDir.slice(1)} / ${parentDir.charAt(0).toUpperCase() + parentDir.slice(1)}`;

  let content = fs.readFileSync(filePath, 'utf8');
  const preamble = getPreamble(pillarName);

  // Regex to find existing preamble
  const regex = /<!-- PREAMBLE_START -->[\s\S]*?<!-- PREAMBLE_END -->\n\n?/;

  if (regex.test(content)) {
    // Update existing
    const newContent = content.replace(regex, preamble);
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated: ${filePath}`);
    }
  } else {
    // Prepend new
    fs.writeFileSync(filePath, preamble + content);
    console.log(`Prepended: ${filePath}`);
  }
});

console.log('Done.');
