const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Find autoData query
const idx = src.indexOf("autoData");
console.log("=== autoData query ===");
console.log(JSON.stringify(src.substring(idx - 20, idx + 300)));

// Find washerTokensUsed calculation in backend
const idx2 = src.indexOf("washerTokensUsed");
console.log("=== washerTokensUsed ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 300)));
