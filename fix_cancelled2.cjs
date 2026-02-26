const fs = require('fs');
const lines = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"completed", label: "Completed"')) {
    lines.splice(i + 1, 0, '  { value: "cancelled", label: "Cancelled" },');
    console.log('Cancelled option added at line', i + 1);
    break;
  }
}

let src = lines.join('\n');

// Fix type
src = src.replace(
  'value: OrderStatus | "all" | "processing"',
  'value: OrderStatus | "all" | "processing" | "cancelled"'
);
src = src.replace(
  'OrderStatus | "all" | "processing"\n  >("all")',
  'OrderStatus | "all" | "processing" | "cancelled"\n  >("all")'
);

fs.writeFileSync('app/washstation/orders/page.tsx', src, 'utf8');
console.log('Done');
