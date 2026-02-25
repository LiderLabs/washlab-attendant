const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/OnlineOrdersContent.tsx', 'utf8');
src = src.replace(
  '} x {pricing.pricePerLoad.toFixed(2)}',
  '} @ GHS {pricing.pricePerLoad.toFixed(2)}'
);
fs.writeFileSync('components/washstation/pages/OnlineOrdersContent.tsx', src, 'utf8');
console.log('fixed');
