const fs = require('fs');
const lines = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8').split('\n');

// ── 1. Replace View button with OrderRowExpander ─────────────────────────
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('variant="ghost"') && lines[i+1] && lines[i+1].includes('size="sm"') &&
      lines[i+2] && lines[i+2].includes('text-primary hover:text-primary/80')) {
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('</Button>')) { end = j; break; }
    }
    lines.splice(i, end - i + 1, '                <OrderRowExpander order={order} stationToken={stationToken ?? null} />');
    console.log('Fix 1 done: View button replaced with OrderRowExpander at line', i);
    break;
  }
}

// ── 2. Remove Time column header ─────────────────────────────────────────
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<TableHead') && (lines[i].includes('>Time<') || lines[i].includes('Time</'))) {
    lines.splice(i, 1);
    console.log('Fix 2a done: Time header removed');
    i--;
  }
}

// ── 3. Remove Order Type column header ───────────────────────────────────
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<TableHead') && (lines[i].includes('>Type<') || lines[i].includes('Type</') || lines[i].includes('Order Type'))) {
    lines.splice(i, 1);
    console.log('Fix 2b done: Order Type header removed');
    i--;
  }
}

// ── 4. Remove Payment Method column header ───────────────────────────────
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<TableHead') && lines[i].includes('Payment')) {
    lines.splice(i, 1);
    console.log('Fix 2c done: Payment Method header removed');
    i--;
  }
}

fs.writeFileSync('components/washstation/OrdersTable.tsx', lines.join('\n'), 'utf8');

// ── 5. Remove Time, Order Type, Payment Method row cells ─────────────────
let src = fs.readFileSync('components/washstation/OrdersTable.tsx', 'utf8');

// Remove time cell (formatDistanceToNow)
src = src.replace(/\s*<TableCell[^>]*>\s*\{formatDistanceToNow[^}]+\}\s*<\/TableCell>/g, '');
console.log('Fix 3a done: Time cell removed');

// Remove order type cell (walk_in)
src = src.replace(/\s*<TableCell[^>]*>\s*\{order\.orderType[^}]+\}\s*<\/TableCell>/g, '');
console.log('Fix 3b done: Order Type cell removed');

// Remove payment method cell (getPaymentMethodLabel)
src = src.replace(/\s*<TableCell[^>]*>\s*\{getPaymentMethodLabel[^}]+\}\s*<\/TableCell>/g, '');
console.log('Fix 3c done: Payment Method cell removed');

fs.writeFileSync('components/washstation/OrdersTable.tsx', src, 'utf8');

// ── 6. Fix orders page filters (cancelled, ready, completed) ─────────────
let page = fs.readFileSync('app/washstation/orders/page.tsx', 'utf8');

// Add cancelled to status options if not already there
if (!page.includes('"cancelled", label: "Cancelled"') && !page.includes('{ value: "cancelled"')) {
  page = page.replace(
    '{ value: "completed", label: "Completed" },\n]',
    '{ value: "completed", label: "Completed" },\n  { value: "cancelled", label: "Cancelled" },\n]'
  );
  console.log('Fix 4 done: Cancelled filter added');
}

// Update TypeScript type to include cancelled
page = page.replace(
  'OrderStatus | "all" | "processing"\n  >("all")',
  'OrderStatus | "all" | "processing" | "cancelled"\n  >("all")'
);

// Fix ready/completed/cancelled filter logic
if (!page.includes('selectedStatus === "ready"')) {
  page = page.replace(
    '    } else {\n      // selectedStatus is a specific OrderStatus\n      if (order.status !== selectedStatus) {\n        return false\n      }\n    }',
    '    } else if (selectedStatus === "ready") {\n      if (order.status !== "ready" && order.status !== "ready_for_pickup") return false\n    } else if (selectedStatus === "completed") {\n      if (order.status !== "completed" && order.status !== "delivered") return false\n    } else if (selectedStatus === "cancelled") {\n      if (order.status !== "cancelled") return false\n    } else {\n      if (order.status !== selectedStatus) return false\n    }'
  );
  console.log('Fix 5 done: ready/completed/cancelled filters fixed');
}

fs.writeFileSync('app/washstation/orders/page.tsx', page, 'utf8');

console.log('All fixes done!');
