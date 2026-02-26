const fs = require('fs');

// ── Fix 1: OrdersTable - remove Time, Order Type, Payment Method columns ─
let table = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

// Remove Order Type cell
table = table.replace(
  "            <TableCell className=\"text-muted-foreground whitespace-nowrap\">{order.orderType === 'walk_in' ? 'Walk-in' : 'Online'}</TableCell>\n",
  ""
);

// Remove Payment Method cell
table = table.replace(
  "            <TableCell className=\"text-muted-foreground text-sm whitespace-nowrap\">{getPaymentMethodLabel(order.paymentMethod)}</TableCell>\n",
  ""
);

// Remove Time cell
table = table.replace(
  "            <TableCell className=\"text-muted-foreground text-sm whitespace-nowrap\">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>\n",
  ""
);

fs.writeFileSync('components/washstation/OrdersTable.tsx', table, 'utf8');
console.log('Fix 1a done: removed row cells');

// Now remove the header columns - need to find them
let tableLines = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8').split('\n');
let headerFound = false;
let removedHeaders = 0;
for (let i = 0; i < tableLines.length; i++) {
  if (tableLines[i].includes('<TableHeader>')) headerFound = true;
  if (headerFound && tableLines[i].includes('</TableHeader>')) { headerFound = false; break; }
  if (headerFound) {
    if (tableLines[i].includes('Time') || tableLines[i].includes('Type') || tableLines[i].includes('Payment Method')) {
      tableLines.splice(i, 1);
      removedHeaders++;
      i--;
    }
  }
}
fs.writeFileSync('components/washstation/OrdersTable.tsx', tableLines.join('\n'), 'utf8');
console.log('Fix 1b done: removed ' + removedHeaders + ' header columns');

// ── Fix 2: Orders page - add Cancelled filter, fix Ready/Completed filters ─
let page = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8');

// Add cancelled to status options
page = page.replace(
  '  { value: "completed", label: "Completed" },\n]',
  '  { value: "completed", label: "Completed" },\n  { value: "cancelled", label: "Cancelled" },\n]'
);

// Update TypeScript type
page = page.replace(
  'const [selectedStatus, setSelectedStatus] = useState<\n    OrderStatus | "all" | "processing"\n  >("all")',
  'const [selectedStatus, setSelectedStatus] = useState<\n    OrderStatus | "all" | "processing" | "cancelled"\n  >("all")'
);

// Fix ready, completed, cancelled filters
page = page.replace(
  '    } else {\n      // selectedStatus is a specific OrderStatus\n      if (order.status !== selectedStatus) {\n        return false\n      }\n    }',
  '    } else if (selectedStatus === "ready") {\n      if (order.status !== "ready" && order.status !== "ready_for_pickup") {\n        return false\n      }\n    } else if (selectedStatus === "completed") {\n      if (order.status !== "completed" && order.status !== "delivered") {\n        return false\n      }\n    } else if (selectedStatus === "cancelled") {\n      if (order.status !== "cancelled") {\n        return false\n      }\n    } else {\n      if (order.status !== selectedStatus) {\n        return false\n      }\n    }'
);

fs.writeFileSync('app/washstation/orders/page.tsx', page, 'utf8');
console.log('Fix 2 done: cancelled filter added, ready/completed filters fixed');

// ── Fix 3: Push all changes and deploy ───────────────────────────────────
console.log('All fixes done!');
