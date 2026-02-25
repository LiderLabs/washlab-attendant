const fs = require('fs');
let src = fs.readFileSync('app/washstation/order-complete/page.tsx', 'utf8');

// The orderNumber should never fall back to the raw orderId
src = src.replace(
  "const orderNumber = order?.orderNumber || orderIdParam || '\u2014';",
  "const orderNumber = order?.orderNumber || '\u2014';"
);

fs.writeFileSync('app/washstation/order-complete/page.tsx', src, 'utf8');
console.log('Order number fallback fixed');
