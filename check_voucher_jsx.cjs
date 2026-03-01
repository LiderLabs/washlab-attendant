const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
// Find the voucher UI section in JSX
const idx = src.indexOf("voucherResult?.valid ?");
console.log(JSON.stringify(src.substring(idx - 200, idx + 800)));
