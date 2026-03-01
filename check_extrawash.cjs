const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

const idx = src.indexOf("extraWash");
console.log("=== NewOrderContent extraWash ===");
console.log(JSON.stringify(src.substring(idx - 100, idx + 500)));

const idx2 = src.indexOf("extraDry");
console.log("=== extraDry ===");
console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 500)));

// Also check how it's saved to the order mutation
const idx3 = src.indexOf("extraLoads");
console.log("=== extraLoads ===");
console.log(JSON.stringify(src.substring(idx3 - 100, idx3 + 500)));
