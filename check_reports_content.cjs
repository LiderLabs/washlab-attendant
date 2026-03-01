const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

const idx = src.indexOf("Paystack");
console.log("=== Paystack ===");
console.log(JSON.stringify(src.substring(idx - 100, idx + 300)));

const idx2 = src.indexOf("paystackAmount");
console.log("=== paystackAmount ===");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 300)));

const idx3 = src.indexOf("Soap");
console.log("=== Soap ===");
console.log(JSON.stringify(src.substring(idx3 - 50, idx3 + 300)));

const idx4 = src.indexOf("setSoapUnits");
console.log("=== setSoapUnits ===");
console.log(JSON.stringify(src.substring(idx4 - 50, idx4 + 200)));
