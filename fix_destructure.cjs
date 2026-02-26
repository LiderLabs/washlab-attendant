const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

src = src.replace(
  'export function OrdersTable({ orders, onOrderClick, onCollectPayment }: OrdersTableProps)',
  'export function OrdersTable({ orders, stationToken, onOrderClick, onCollectPayment }: OrdersTableProps)'
);

fs.writeFileSync('components/washstation/OrdersTable.tsx', src, 'utf8');
console.log('Done');
