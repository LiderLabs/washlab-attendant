const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

// Find and replace the entire TableHeader block
const headerStart = src.indexOf('<TableHeader>');
const headerEnd = src.indexOf('</TableHeader>') + '</TableHeader>'.length;

const newHeader = `<TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Services</TableHead>
          </TableRow>
        </TableHeader>`;

src = src.substring(0, headerStart) + newHeader + src.substring(headerEnd);
console.log("Headers replaced");

// Find and replace entire TableBody content - reorder cells and drop Status
const bodyStart = src.indexOf('<TableBody>');
const bodyEnd = src.indexOf('</TableBody>') + '</TableBody>'.length;
console.log("TableBody found:", bodyStart !== -1);
console.log("Current body:", src.substring(bodyStart, bodyStart + 800));

fs.writeFileSync("components/washstation/OrdersTable.tsx", src, "utf8");
