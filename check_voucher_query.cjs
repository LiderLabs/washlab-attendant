const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("vouchers.validate");
console.log(JSON.stringify(src.substring(idx - 50, idx + 300)));
