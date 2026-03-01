const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Find washer/dryer token logic
const idx = src.indexOf("washerTokens");
console.log("=== washerTokens ===");
console.log(JSON.stringify(src.substring(idx - 50, idx + 400)));

const idx2 = src.indexOf("dryerTokens");
console.log("=== dryerTokens ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));

const idx3 = src.indexOf("extraWash");
console.log("=== extraWash ===");
console.log(JSON.stringify(src.substring(idx3 - 50, idx3 + 400)));
