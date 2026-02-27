const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("getPrice\|totalLoads\|finalPrice\|calculat");
const idx2 = src.indexOf("totalLoads");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 600)));
