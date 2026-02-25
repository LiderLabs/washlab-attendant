const fs = require('fs');
let src = fs.readFileSync('app/washstation/order-complete/page.tsx', 'utf8');

// Fix garbled em dash fallback
src = src.replace("order?.orderNumber || 'â\u20acâ\u20ac'", "order?.orderNumber || '—'");
src = src.replace(/order\?\.orderNumber \|\| '[^']*'/g, "order?.orderNumber || '—'");

fs.writeFileSync('app/washstation/order-complete/page.tsx', src, 'utf8');
console.log('Order number fix done');
