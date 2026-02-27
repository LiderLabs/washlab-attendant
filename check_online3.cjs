const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
const idx = src.indexOf("whitesSeparate");
console.log("whitesSeparate at:", idx);
const idx2 = src.indexOf("Wash & Dry\|wash_and_dry\|serviceType.*selected");
const idx3 = src.lastIndexOf("serviceType");
console.log(JSON.stringify(src.substring(idx3 - 50, idx3 + 300)));
