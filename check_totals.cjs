const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

const idx = src.indexOf("totalTokenRevenue");
console.log("=== totalTokenRevenue ===");
console.log(JSON.stringify(src.substring(idx - 50, idx + 300)));

const idx2 = src.indexOf("totalRecorded");
console.log("=== totalRecorded ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 300)));

const idx3 = src.indexOf("Token Revenue");
console.log("=== Token Revenue UI ===");
console.log(JSON.stringify(src.substring(idx3, idx3 + 400)));
