const fs = require("fs");
const src = fs.readFileSync("app/washstation/orders/page.tsx", "utf8");
console.log("LENGTH:", src.length);

const idx = src.indexOf("washing");
console.log("=== washing ===");
console.log(JSON.stringify(src.substring(idx - 200, idx + 400)));

const idx2 = src.indexOf("Start");
console.log("=== Start button ===");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 400)));
