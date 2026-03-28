const fs = require("fs");
const src = fs.readFileSync("app/washstation/payment/page.tsx", "utf8");
const idx = src.indexOf("Failed to open payment window");
console.log(src.substring(Math.max(0, idx - 300), idx + 100));
