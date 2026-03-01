const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Find serviceBreakdown and token calculation
const idx = src.indexOf("serviceBreakdown");
console.log("=== serviceBreakdown ===");
console.log(JSON.stringify(src.substring(idx - 50, idx + 600)));

// Find tokensUsed
const idx2 = src.indexOf("tokensUsed");
console.log("=== tokensUsed ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));

// Find how washerTokens is SET (not just declared)
const idx3 = src.indexOf("setWasherTokens(");
console.log("=== setWasherTokens called ===");
console.log(JSON.stringify(src.substring(idx3 - 100, idx3 + 300)));
