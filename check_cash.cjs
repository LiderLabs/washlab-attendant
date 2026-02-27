const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("setPaymentMethod");
console.log(JSON.stringify(src.substring(idx - 100, idx + 600)));
