const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
// Find Paystack integration
const idx = src.indexOf("paystack\|Paystack\|payment\|handleProceed");
const idx2 = src.indexOf("handleProceedToPayment");
console.log(JSON.stringify(src.substring(idx2, idx2 + 800)));
