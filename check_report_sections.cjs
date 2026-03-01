const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Find the Payment Breakdown section in the UI
const idx = src.indexOf("Payment Breakdown");
console.log("=== Payment Breakdown UI ===");
console.log(JSON.stringify(src.substring(idx, idx + 1500)));

// Find soap UI section
const idx2 = src.indexOf("Soap");
console.log("=== Soap UI ===");
console.log(JSON.stringify(src.substring(idx2, idx2 + 600)));

// Find Manual Entries section
const idx3 = src.indexOf("Manual Entries");
console.log("=== Manual Entries ===");
console.log(JSON.stringify(src.substring(idx3, idx3 + 800)));
