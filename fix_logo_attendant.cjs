const fs = require('fs');
const lines = fs.readFileSync('app/washstation/page.tsx', 'utf8').split('\n');

// Find and fix the duplicate nested header
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<header className="p-6">') && 
      lines[i+1] && lines[i+1].includes('<header className="p-6">')) {
    // Remove lines i+1 (inner header open), i+2 (Logo), i+3 (inner header close)
    lines.splice(i+1, 3, '        <Logo size="sm" />');
    console.log('Fixed duplicate header at line', i);
    break;
  }
}

fs.writeFileSync('app/washstation/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
