const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

// Remove leftover extra loads block still in left column (the one with 'extra load(s) added to price')
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("extra load(s) added to price") && lines[i].includes('text-primary mt-2')) {
    // Go back to find the opening div of this block
    let start = i;
    for (let j = i; j >= i - 6; j--) {
      if (lines[j].includes('bg-muted/50 rounded-xl border') || lines[j].includes('ADDITIONAL LOADS')) {
        start = j - 1;
        break;
      }
    }
    // Find the closing )}
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j].trim() === ')}') { end = j; break; }
    }
    lines.splice(start, end - start + 1);
    console.log('Removed leftover extra loads block, lines', start, '-', end);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
