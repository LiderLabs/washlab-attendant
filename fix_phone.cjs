const fs = require("fs");
let src = fs.readFileSync("app/washstation/order-complete/page.tsx", "utf8");

// Fix 1: Pass isSessionValid to useStationOrder so order actually loads
src = src.replace(
  `  const { order, isLoading } = useStationOrder(
    stationToken,
    orderIdParam ? (orderIdParam as Id<'orders'>) : null
  );`,
  `  const { order, isLoading } = useStationOrder(
    stationToken,
    orderIdParam ? (orderIdParam as Id<'orders'>) : null,
    isSessionValid
  );`
);

// Fix 2: Also try customerPhoneNumber as top-level field (some orders store it there)
src = src.replace(
  `    const rawPhone = order?.customer?.phoneNumber || order?.customerPhoneNumber || '';`,
  `    const rawPhone = order?.customer?.phoneNumber || (order as any)?.customerPhoneNumber || (order as any)?.customerPhone || '';`
);

fs.writeFileSync("app/washstation/order-complete/page.tsx", src, "utf8");
console.log("Done");
