const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderCard.tsx", "utf8");
const idx = src.indexOf("return (");
console.log(JSON.stringify(src.substring(idx, idx + 1000)));
