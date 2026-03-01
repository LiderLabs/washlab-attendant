const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

const idx = src.indexOf("washing");
console.log("=== washing ===");
console.log(JSON.stringify(src.substring(idx - 200, idx + 400)));

const idx2 = src.indexOf("updateStatus");
console.log("=== updateStatus ===");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 500)));

const idx3 = src.indexOf("checked_in");
console.log("=== checked_in ===");
console.log(JSON.stringify(src.substring(idx3 - 100, idx3 + 300)));
