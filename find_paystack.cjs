const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Fix 1: Remove Paystack from breakdown - the replace didn't work before, find exact string
const idx = src.indexOf("paystackAmount]].map");
console.log("Found at:", idx);
console.log("Context:", JSON.stringify(src.substring(idx - 150, idx + 50)));
