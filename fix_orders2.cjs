const fs = require("fs");

// ── Fix 1: OrdersTable rows (use indexOf to avoid spacing mismatch) ──
let src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

const startMarker = '<TableRow key={order._id} className="hover:bg-muted/30 transition-colors">';
const endMarker = '</TableRow>';

const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker, startIdx) + endMarker.length;

if (startIdx === -1) {
  console.log("TableRow marker not found");
} else {
  const before = src.substring(0, startIdx);
  const after = src.substring(endIdx);

  const newRow = `<TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="whitespace-nowrap" onClick={e => e.stopPropagation()}>
              <OrderRowExpander order={order} stationToken={stationToken ?? null} unpaid={unpaid} onCollectPayment={() => onCollectPayment?.(order._id)} />
            </TableCell>
            <TableCell className="whitespace-nowrap font-semibold text-foreground">{order.orderNumber}</TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {order.customer?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'CU'}
                </div>
                <span className="font-medium text-foreground">{order.customer?.name || 'Unknown'}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap">{serviceType} ({weight.toFixed(1)}kg)</TableCell>
            <TableCell className="whitespace-nowrap">
              <span className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium \${status.className}\`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </TableCell>
          </TableRow>`;

  src = before + newRow + after;
  console.log("Row cells reordered");
}

fs.writeFileSync("components/washstation/OrdersTable.tsx", src, "utf8");

// ── Fix 2: OrdersContent.tsx - tabs array and filter logic ──
let content = fs.readFileSync("components/washstation/pages/OrdersContent.tsx", "utf8");

// Find the tabs array
const tabsIdx = content.indexOf("const tabs");
console.log("Tabs array:", content.substring(tabsIdx, tabsIdx + 400));
