const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");
console.log("LENGTH:", src.length);

// Find autoData soap loading
const idx = src.indexOf("setSoapUnits");
console.log("=== setSoapUnits calls ===");
[...src.matchAll(/setSoapUnits[^;]+;/g)].forEach(m => console.log(JSON.stringify(m[0])));

// Find numField helper
const idx2 = src.indexOf("function numField");
if (idx2 === -1) {
  const idx3 = src.indexOf("numField");
  console.log("=== numField ===");
  console.log(JSON.stringify(src.substring(idx3, idx3 + 300)));
}

// Find where autoData loads soapUnits
const idx4 = src.indexOf("soapUnits");
console.log("=== autoData soapUnits ===");
console.log(JSON.stringify(src.substring(idx4 - 50, idx4 + 200)));

// Find washerTokens UI section
const idx5 = src.indexOf("WASHER TOKEN");
console.log("=== WASHER TOKENS UI ===");
console.log(JSON.stringify(src.substring(idx5, idx5 + 600)));
