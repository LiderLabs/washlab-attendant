const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("Cash");
console.log(JSON.stringify(src.substring(idx - 200, idx + 800)));
