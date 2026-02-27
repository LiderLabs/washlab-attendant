const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("finalPrice\|total\|amount\|Paystack\|paystack");
const idx2 = src.indexOf("amount");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 500)));
