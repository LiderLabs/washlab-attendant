const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderList.tsx", "utf8");
console.log(JSON.stringify(src.substring(0, 1200)));
