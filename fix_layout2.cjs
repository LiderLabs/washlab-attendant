const fs = require('fs');
const lines = fs.readFileSync('components/washstation/WashStationLayout.tsx', 'utf8').split('\n');

// Find and remove the leftover popup div block
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fixed inset-0 z-50 flex items-center justify-center bg-black/50')) {
    // Go back to find the opening wrapper line
    start = i - 1;
    // Go forward to find the closing )} 
    for (let j = i; j < lines.length; j++) {
      if (lines[j].trim() === ')}') { end = j; break; }
    }
    break;
  }
}

if (start > -1 && end > -1) {
  lines.splice(start, end - start + 1);
  console.log('Removed popup block from line', start, 'to', end);
} else {
  console.log('Block not found, start:', start, 'end:', end);
}

fs.writeFileSync('components/washstation/WashStationLayout.tsx', lines.join('\n'), 'utf8');
console.log('Done');
