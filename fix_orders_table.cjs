const fs = require("fs");

// Fix OrdersTable.tsx - reorder columns: Actions | Order ID | Customer | Services | Status
let src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

// Fix headers
src = src.replace(
  `            <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</TableHead>  

            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Action</TableHead>  
          </TableRow>`,
  `            <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Services</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</TableHead>
          </TableRow>`
);
console.log("Headers done");

// Move Actions cell to first position in each row
// Find the row pattern and reorder: put the last cell (OrderRowExpander) first
const oldRow = `          <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
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
            <TableCell className="whitespace-nowrap" onClick={e => e.stopPropagation()}>
              <OrderRowExpander order={order} stationToken={stationToken ?? null} unpaid={unpaid} onCollectPayment={() => onCollectPayment?.(order._id)} />
            </TableCell>
          </TableRow>`;

const newRow = `          <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
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

if (src.includes(oldRow)) {
  src = src.replace(oldRow, newRow);
  console.log("Row cells reordered");
} else {
  console.log("Row pattern not matched - check spacing");
}

fs.writeFileSync("components/washstation/OrdersTable.tsx", src, "utf8");

// Fix OrdersContent.tsx - tabs: Orders | Completed
let content = fs.readFileSync("components/washstation/pages/OrdersContent.tsx", "utf8");

// Show current tabs area for debugging
const tabIdx = content.indexOf("tab");
console.log("Tab context:", content.substring(tabIdx, tabIdx + 500));
