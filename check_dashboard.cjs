const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/DashboardContent.tsx", "utf8");
const idx = src.indexOf("OrderList");
console.log(JSON.stringify(src.substring(idx - 100, idx + 300)));
