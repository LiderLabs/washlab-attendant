const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderCard.tsx", "utf8");
const idx = src.indexOf("serviceType\|estimatedLoads\|Wash\|loads");
const idx2 = src.indexOf("serviceType");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));
