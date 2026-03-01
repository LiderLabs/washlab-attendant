const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

const idx = src.indexOf("Washer Token");
console.log("=== Washer Token UI ===");
console.log(JSON.stringify(src.substring(idx - 50, idx + 500)));
