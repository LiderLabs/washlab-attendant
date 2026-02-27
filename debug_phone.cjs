const fs = require("fs");
let src = fs.readFileSync("app/washstation/order-complete/page.tsx", "utf8");

// Log all phone-related fields to debug
const debugIdx = src.indexOf("const handleWhatsAppReceipt");
console.log("WhatsApp function:", src.substring(debugIdx, debugIdx + 400));
