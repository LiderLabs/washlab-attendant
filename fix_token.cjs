const fs = require('fs');
let src = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8');

src = src.replace(
  '<OrdersTable\n                orders={filteredOrders}',
  '<OrdersTable\n                orders={filteredOrders}\n                stationToken={stationToken}'
);

fs.writeFileSync('app/washstation/orders/page.tsx', src, 'utf8');
console.log('Done');
