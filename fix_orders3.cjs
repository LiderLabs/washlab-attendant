const fs = require("fs");
let content = fs.readFileSync("components/washstation/pages/OrdersContent.tsx", "utf8");

// Fix tabs - replace the inline array
content = content.replace(
  `[
          { id: 'all', label: 'All' },
          { id: 'processing', label: 'Processing' },
          { id: 'ready', label: 'Ready' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ]`,
  `[
          { id: 'orders', label: 'Orders' },
          { id: 'completed', label: 'Completed' },
        ]`
);

// Also try alternate spacing
content = content.replace(
  /\[\s*\n\s*\{ id: 'all'[\s\S]*?\{ id: 'cancelled'[^\}]*\},?\s*\]/,
  `[
          { id: 'orders', label: 'Orders' },
          { id: 'completed', label: 'Completed' },
        ]`
);

fs.writeFileSync("components/washstation/pages/OrdersContent.tsx", content, "utf8");
console.log("Tabs fixed");

// Fix OrdersTable.tsx - remove Status column entirely, keep Actions|OrderID|Customer|Services only
let src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

// Fix headers - remove Status
src = src.replace(
  `            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Services</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Status</TableHead>`,
  `            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Services</TableHead>`
);

// Remove the Status cell from rows
src = src.replace(
  `            <TableCell className="whitespace-nowrap">
              <span className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium \${status.className}\`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </TableCell>`,
  ''
);

fs.writeFileSync("components/washstation/OrdersTable.tsx", src, "utf8");
console.log("Table columns fixed");
