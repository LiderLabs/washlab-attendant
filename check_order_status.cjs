const fs = require("fs");
const src = fs.readFileSync("convex/stations.ts", "utf8");
const idx = src.lastIndexOf("paymentStatus");
console.log(JSON.stringify(src.substring(idx - 50, idx + 150)));
