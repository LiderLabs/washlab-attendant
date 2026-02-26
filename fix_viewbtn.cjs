const fs = require('fs');
let src = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

// Add stationToken to destructure in component function
src = src.replace(
  'export function OrdersTable({ orders, onOrderClick, onCollectPayment }',
  'export function OrdersTable({ orders, stationToken, onOrderClick, onCollectPayment }'
);

// Add OrderRowExpander import if missing
if (!src.includes('OrderRowExpander')) {
  src = src.replace(
    "import { useMemo } from 'react';",
    "import { useMemo } from 'react';\nimport { OrderRowExpander } from './OrderRowExpander';"
  );
}

// Replace the View button with OrderRowExpander
src = src.replace(
                  <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                  onClick={() => onOrderClick?.(order._id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>,
                  <OrderRowExpander order={order} stationToken={stationToken ?? null} />
);

fs.writeFileSync('components/washstation/OrdersTable.tsx', src, 'utf8');
console.log('Done - View button replaced with OrderRowExpander');
