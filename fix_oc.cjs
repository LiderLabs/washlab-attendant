const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OrdersContent.tsx", "utf8");
src = src.replace(
  "const { orders, stationToken } = useOrders();",
  "const { orders } = useOrders();"
);
fs.writeFileSync("components/washstation/pages/OrdersContent.tsx", src, "utf8");
console.log("Done");
