const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("weight");
console.log(JSON.stringify(src.substring(idx - 20, idx + 500)));
