const fs = require('fs');
const lines = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{(extraWashLoads > 0 || extraDryLoads > 0) && (') && 
      lines[i+1] && lines[i+1].includes('</div>')) {
    lines.splice(i, 1);
    console.log('Removed broken fragment at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', lines.join('\n'), 'utf8');
console.log('Done. Lines:', lines.length);
