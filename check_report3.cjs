const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
const idx = src.indexOf("Washer Tokens");
console.log("Render:", JSON.stringify(src.substring(idx - 100, idx + 400)));
