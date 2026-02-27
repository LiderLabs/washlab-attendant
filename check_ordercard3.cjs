const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderCard.tsx", "utf8");
// Get the full interface
const idx = src.indexOf("interface OrderCardProps");
console.log(JSON.stringify(src.substring(idx, idx + 800)));
