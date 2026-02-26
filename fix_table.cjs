const fs = require('fs');
let table = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

// Remove Amount Paid header
table = table.replace(
  '\n            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Amount Paid</TableHead>',
  ''
);

// Remove payment status badge cell
table = table.replace(
  /\s*<TableCell className="whitespace-nowrap">\s*\{unpaid \?[\s\S]*?<\/TableCell>/m,
  ''
);

// Remove amount value cell
table = table.replace(
  /\s*<TableCell className="text-sm font-medium whitespace-nowrap">\{unpaid \?[^<]+<\/TableCell>/,
  ''
);

// Pass unpaid and onCollectPayment to OrderRowExpander
table = table.replace(
  '<OrderRowExpander order={order} stationToken={stationToken ?? null} />',
  '<OrderRowExpander order={order} stationToken={stationToken ?? null} unpaid={unpaid} onCollectPayment={() => onCollectPayment?.(order._id)} />'
);

// Tablet responsive
table = table.replace('className="min-w-[900px]"', 'className="w-full"');
table = table.replace('max-h-[400px]', 'max-h-[70vh]');

fs.writeFileSync('components/washstation/OrdersTable.tsx', table, 'utf8');
console.log('Step 2 done: OrdersTable patched');
