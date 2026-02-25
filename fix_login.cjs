const fs = require('fs');
const lines = fs.readFileSync('app/washstation/page.tsx', 'utf8').split('\n');
const filtered = lines.filter(l => 
  !l.includes('Available codes') && 
  !l.includes('activeBranches') &&
  !l.includes('Skip to Dashboard')
);
fs.writeFileSync('app/washstation/page.tsx', filtered.join('\n'), 'utf8');
console.log('Done');
