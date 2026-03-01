const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Find the payment breakdown UI to see how inputs are rendered
const idx = src.indexOf("Mobile Money");
console.log("=== Mobile Money UI ===");
console.log(JSON.stringify(src.substring(idx - 100, idx + 600)));

// Find washer tokens UI
const idx2 = src.indexOf("Washer Token");
console.log("=== Washer Tokens UI ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));

// Find totalTokenRevenue calculation
const idx3 = src.indexOf("totalTokenRevenue");
console.log("=== totalTokenRevenue ===");
console.log(JSON.stringify(src.substring(idx3 - 20, idx3 + 200)));
