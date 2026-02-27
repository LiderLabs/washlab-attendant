const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("handleProceedToPayment");
console.log(JSON.stringify(src.substring(idx, idx + 1500)));
