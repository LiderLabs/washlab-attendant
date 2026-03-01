const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrdersTable.tsx", "utf8");

const idx = src.indexOf("washing");
console.log("=== washing ===");
console.log(JSON.stringify(src.substring(idx - 200, idx + 400)));

const idx2 = src.indexOf("Start");
console.log("=== Start ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));

const idx3 = src.indexOf("updateStatus");
console.log("=== updateStatus ===");
console.log(JSON.stringify(src.substring(idx3 - 100, idx3 + 400)));
