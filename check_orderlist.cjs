const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderList.tsx", "utf8");
const idx = src.indexOf("OrderCard");
console.log(JSON.stringify(src.substring(idx - 50, idx + 300)));
