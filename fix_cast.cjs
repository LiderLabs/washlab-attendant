const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrderRowExpander.tsx', 'utf8');

src = src.replace(
  'await changeStatus(order._id, status)',
  'await changeStatus(order._id as Id<"orders">, status)'
);

fs.writeFileSync('components/washstation/OrderRowExpander.tsx', src, 'utf8');
console.log('Done');
