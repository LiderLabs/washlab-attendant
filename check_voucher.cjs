const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("handleApplyVoucher");
console.log(JSON.stringify(src.substring(idx, idx + 400)));
