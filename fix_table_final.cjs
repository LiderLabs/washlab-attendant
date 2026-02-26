const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

const memoStart = src.indexOf("const tableRows = useMemo(");
const memoEnd = src.indexOf("  );", memoStart) + 4;

const newMemo = `const tableRows = useMemo(
    () =>
      orders.map((order) => {
        const status = getStatusBadge(order.status);
        const StatusIcon = status.icon;
        const weight = order.actualWeight || order.estimatedWeight || 0;
        const serviceType = formatServiceType(order.serviceType);
        const unpaid = order.paymentStatus !== "paid";
        return (
          <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="whitespace-nowrap" onClick={e => e.stopPropagation()}>
              <OrderRowExpander order={order} stationToken={stationToken ?? null} unpaid={unpaid} onCollectPayment={() => onCollectPayment?.(order._id)} />
            </TableCell>
            <TableCell className="whitespace-nowrap font-semibold text-foreground">{order.orderNumber}</TableCell>
            <TableCell className="whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {order.customer?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "CU"}
                </div>
                <span className="font-medium text-foreground">{order.customer?.name || "Unknown"}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap">{serviceType} ({weight.toFixed(1)}kg)</TableCell>
          </TableRow>
        );
      }),
    [orders, onCollectPayment]
  );`;

src = src.substring(0, memoStart) + newMemo + src.substring(memoEnd);

const headerStart = src.indexOf("<TableHeader>");
const headerEnd = src.indexOf("</TableHeader>") + "</TableHeader>".length;
const newHeader = `<TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Order ID</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Customer</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Services</TableHead>
          </TableRow>
        </TableHeader>`;
src = src.substring(0, headerStart) + newHeader + src.substring(headerEnd);

fs.writeFileSync("components/washstation/OrdersTable.tsx", src, "utf8");
console.log("Done");
