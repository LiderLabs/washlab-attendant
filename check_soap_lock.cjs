const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

const idx = src.indexOf("Soap Used");
console.log("=== Full Soap section ===");
console.log(JSON.stringify(src.substring(idx, idx + 500)));

// Check isSubmitted value
const idx2 = src.indexOf("isSubmitted");
console.log("=== isSubmitted ===");
console.log(JSON.stringify(src.substring(idx2 - 20, idx2 + 150)));
