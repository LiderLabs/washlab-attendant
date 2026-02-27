const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("pricing.");
console.log(JSON.stringify(src.substring(idx - 50, idx + 1000)));
