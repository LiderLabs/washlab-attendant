const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("voucherResult?.valid ?");
console.log(JSON.stringify(src.substring(idx + 800, idx + 1600)));
