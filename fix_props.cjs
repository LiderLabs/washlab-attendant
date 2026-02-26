const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

src = src.replace(
  'interface OrdersTableProps {\n  orders: Order[];\n  stationToken?: string | null;\n  onOrderClick?: (orderId: string) => void;\n}',
  'interface OrdersTableProps {\n  orders: Order[];\n  stationToken?: string | null;\n  onOrderClick?: (orderId: Id<\'orders\'>) => void;\n  onCollectPayment?: (orderId: Id<\'orders\'>) => void;\n}'
);

fs.writeFileSync('components/washstation/OrdersTable.tsx', src, 'utf8');
console.log('Done');
