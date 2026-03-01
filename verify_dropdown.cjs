const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");

// Check 1: activeVouchers query
const idx1 = src.indexOf("activeVouchers");
console.log("activeVouchers:", JSON.stringify(src.substring(idx1, idx1 + 150)));

// Check 2: dropdown render
const idx2 = src.indexOf("<select");
console.log("dropdown:", JSON.stringify(src.substring(idx2, idx2 + 300)));
