const fs = require('fs');
const lines = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8').split('\n');

// Find and remove the SECOND interface OrdersTableProps block (lines ~95-100)
let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('interface OrdersTableProps {')) {
    count++;
    if (count === 2) {
      // Remove this block (interface + its lines until closing })
      let end = i;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === '}') { end = j; break; }
      }
      lines.splice(i, end - i + 2); // +2 to also remove trailing blank line
      console.log('Removed duplicate interface at line', i);
      break;
    }
  }
}

fs.writeFileSync('components/washstation/OrdersTable.tsx', lines.join('\n'), 'utf8');
console.log('Done');
