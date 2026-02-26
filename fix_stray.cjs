const fs = require('fs');
const lines = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '<Button') {
    lines.splice(i, 1);
    console.log('Removed stray <Button at line', i);
    break;
  }
}

fs.writeFileSync('components/washstation/OrdersTable.tsx', lines.join('\n'), 'utf8');
console.log('Done');
