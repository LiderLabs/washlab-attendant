const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
console.log(JSON.stringify(src.substring(6200, 6600)));
