const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("serviceType");
console.log(JSON.stringify(src.substring(idx - 100, idx + 400)));
