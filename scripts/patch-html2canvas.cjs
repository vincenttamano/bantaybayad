const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'html2canvas.js'),
  path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'html2canvas.esm.js')
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Replace the throw with a safe fallback pack(15, 23, 42, 1)
    if (content.includes('throw new Error("Attempting to parse an unsupported color function')) {
      content = content.replace(
        /if\s*\(\s*typeof colorFunction === ['"]undefined['"]\s*\)\s*\{\s*throw new Error\([^)]*\);\s*\}/g,
        "if (typeof colorFunction === 'undefined') { return pack(15, 23, 42, 1); }"
      );
    }

    // 2. Add oklch, oklab, lab, color to SUPPORTED_COLOR_FUNCTIONS
    if (!content.includes('oklch:')) {
      content = content.replace(
        /var SUPPORTED_COLOR_FUNCTIONS = \{([\s\S]*?)\};/,
        `var SUPPORTED_COLOR_FUNCTIONS = {$1,
    oklch: function() { return pack(15, 23, 42, 1); },
    oklab: function() { return pack(15, 23, 42, 1); },
    lab: function() { return pack(15, 23, 42, 1); },
    color: function() { return pack(15, 23, 42, 1); }
};`
      );
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched for color safety:', file);
  }
}
