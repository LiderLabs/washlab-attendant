const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === ')}' &&
      lines[i-1] && lines[i-1].trim() === '</div>' &&
      lines[i-2] && lines[i-2].trim() === '</div>' &&
      lines[i+1] && lines[i+1].trim() === '</div>') {
    lines.splice(i, 1);
    console.log('Removed orphaned )} at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
