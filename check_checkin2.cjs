const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("checkInOrder as any");
console.log(JSON.stringify(src.substring(idx - 50, idx + 600)));
