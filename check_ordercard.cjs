const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderCard.tsx", "utf8");
console.log(JSON.stringify(src.substring(0, 1000)));
