const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
// Find WhatsApp message
const idx = src.indexOf("whatsapp\|wa.me\|message\|WhatsApp");
const idx2 = src.indexOf("wa.me");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 600)));
