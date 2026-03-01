const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Payment breakdown UI
const idx = src.indexOf("Payment Breakdown");
console.log("=== Payment Breakdown UI ===");
console.log(JSON.stringify(src.substring(idx, idx + 800)));

// Soap UI
const idx2 = src.indexOf("Soap Used");
if (idx2 === -1) {
  const idx3 = src.indexOf("soapUnits");
  console.log("=== soapUnits in UI ===");
  console.log(JSON.stringify(src.substring(idx3 + 200, idx3 + 600)));
} else {
  console.log("=== Soap Used UI ===");
  console.log(JSON.stringify(src.substring(idx2, idx2 + 400)));
}

// washerTokensUsed in autoData
const idx4 = src.indexOf("washerTokensUsed");
console.log("=== washerTokensUsed ===");
console.log(JSON.stringify(src.substring(idx4 - 50, idx4 + 200)));

// submit handler
const idx5 = src.indexOf("submitted successfully");
console.log("=== submit success ===");
console.log(JSON.stringify(src.substring(idx5 - 100, idx5 + 200)));
