const fs = require("fs");
const src = fs.readFileSync("hooks/useStationOrders.ts", "utf8");
const idx = src.indexOf("serviceType\|whitesSeparate\|estimatedLoads");
const idx2 = src.indexOf("serviceType");
console.log("serviceType at:", idx2);
console.log(JSON.stringify(src.substring(0, 600)));
