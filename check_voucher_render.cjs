const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
// Find the voucher section render
const idx = src.indexOf("voucherResult");
console.log(JSON.stringify(src.substring(idx - 100, idx + 600)));
