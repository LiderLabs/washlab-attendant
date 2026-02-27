const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
// Find the full WhatsApp message builder
const idx = src.indexOf("sendWhatsApp\|whatsappMessage\|wa_message\|handleWhatsApp\|openWhatsApp");
const idx2 = src.indexOf("openWhatsApp");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 800)));
