const fs = require('fs');
let src = fs.readFileSync('app/washstation/payment/page.tsx', 'utf8');

// Fix voucher query - skip if code is short to prevent server error
src = src.replace(
  "voucherCode.length >= 3 ? { code: voucherCode.toUpperCase(), orderTotal: 1, branchId: \"skip\" as any } :",
  "voucherCode.length >= 6 ? { code: voucherCode.toUpperCase(), orderTotal: order?.totalPrice ?? 1 } :"
);

fs.writeFileSync('app/washstation/payment/page.tsx', src, 'utf8');
console.log('Voucher fix done');
