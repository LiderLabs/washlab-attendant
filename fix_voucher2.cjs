const fs = require('fs');
let src = fs.readFileSync('app/washstation/payment/page.tsx', 'utf8');

src = src.replace(
  'voucherCode.length >= 6 ? { code: voucherCode.toUpperCase(), orderTotal: order?.totalPrice ?? 1 } : "skip"',
  'voucherCode.length >= 6 ? { code: voucherCode.toUpperCase(), orderTotal: 1 } : "skip"'
);

fs.writeFileSync('app/washstation/payment/page.tsx', src, 'utf8');
console.log('Done');
