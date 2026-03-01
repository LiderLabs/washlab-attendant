const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Get the full payment map render
const idx = src.indexOf(".map(({ label, value, setter, color })");
console.log("=== Payment map render ===");
console.log(JSON.stringify(src.substring(idx, idx + 600)));

// Get dryer tokens UI
const idx2 = src.indexOf("Dryer Token");
console.log("=== Dryer Token UI ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));
