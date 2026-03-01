const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Check dryer tokens and payment inputs
const idx = src.indexOf("setDryerTokens");
console.log("=== Dryer input ===");
console.log(JSON.stringify(src.substring(idx - 100, idx + 200)));

// Check payment inputs
const idx2 = src.indexOf("setMobileMoneyAmount");
console.log("=== Payment input ===");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 400)));
