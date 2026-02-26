const fs = require('fs');
let src = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8');

src = src.replace(
  'if (!allProcessingStatuses.includes(order.status)) {\n        return false // Hide online orders that haven\'t been checked in yet\n      }',
  'if (!allProcessingStatuses.includes(order.status) && order.status !== "cancelled") {\n        return false // Hide online orders that haven\'t been checked in yet\n      }'
);

fs.writeFileSync('app/washstation/orders/page.tsx', src, 'utf8');
console.log('Done - fixed:', src.includes('order.status !== "cancelled"') ? 'OK' : 'MISSED');
