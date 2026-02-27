const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("whitesSeparate\|serviceType\|whites");
const idx2 = src.indexOf("serviceType");
console.log("serviceType at:", idx2);
const idx3 = src.indexOf("order.");
console.log(JSON.stringify(src.substring(idx3 - 50, idx3 + 400)));
