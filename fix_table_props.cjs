const fs = require('fs');
let table = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

// Remove the duplicate interface we added
table = table.replace(
  'interface OrdersTableProps {\n  orders: Order[];\n  stationToken?: string | null;\n  onOrderClick?: (orderId: string) => void;\n}\n\n',
  ''
);

// Add stationToken to the existing OrdersTableProps instead
table = table.replace(
  '  onOrderClick?: (orderId: Id<\'orders\'>) => void;',
  '  stationToken?: string | null;\n  onOrderClick?: (orderId: Id<\'orders\'>) => void;'
);

fs.writeFileSync('components/washstation/OrdersTable.tsx', table, 'utf8');
console.log('Fixed duplicate interface');
