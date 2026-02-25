const fs = require('fs');
const lines = fs.readFileSync('app/washstation/order-complete/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('orderNumber') && lines[i].includes('order?.orderNumber')) {
    lines[i] = "  const orderNumber = order?.orderNumber || '—';";
    console.log('Fixed orderNumber at line', i + 1);
    break;
  }
}

fs.writeFileSync('app/washstation/order-complete/page.tsx', lines.join('\n'), 'utf8');
console.log('Done');
