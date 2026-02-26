const fs = require('fs');
const lines = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (!allProcessingStatuses.includes(order.status))')) {
    lines[i] = '      if (!allProcessingStatuses.includes(order.status) && order.status !== "cancelled") {';
    console.log('Fixed at line', i);
    break;
  }
}

fs.writeFileSync('app/washstation/orders/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
