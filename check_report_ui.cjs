const fs = require("fs");
const src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Check paystack section
const idx = src.indexOf("paystack");
console.log("=== paystack ===");
console.log(JSON.stringify(src.substring(idx - 100, idx + 300)));

// Check soap section
const idx2 = src.indexOf("soap");
console.log("=== soap ===");
console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 400)));

// Check what fields are editable vs read-only
const idx3 = src.indexOf("disabled");
console.log("=== first disabled ===");
console.log(JSON.stringify(src.substring(idx3 - 50, idx3 + 200)));

// Check paystackAmount usage
const all = [...src.matchAll(/paystackAmount/g)];
console.log("paystackAmount occurrences:", all.length);
console.log("first ctx:", JSON.stringify(src.substring(all[0].index - 50, all[0].index + 200)));
