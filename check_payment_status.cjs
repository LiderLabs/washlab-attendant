const fs = require("fs");
const src = fs.readFileSync("convex/payments.ts", "utf8");
const idx = src.indexOf("paymentStatus");
console.log(JSON.stringify(src.substring(idx - 50, idx + 200)));
