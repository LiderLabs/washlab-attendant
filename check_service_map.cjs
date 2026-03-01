const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// See the full service mapping
const idx = src.indexOf("dbServices = branchServices.map");
console.log(JSON.stringify(src.substring(idx, idx + 400)));

// See how ServiceCard is rendered
const idx2 = src.indexOf("<ServiceCard");
console.log(JSON.stringify(src.substring(idx2, idx2 + 400)));
