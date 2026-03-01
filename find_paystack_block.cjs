const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Remove the standalone Paystack block
const start = src.indexOf("{paystackAmount > 0 && (");
const end = src.indexOf(")}\n          </div>", start) + ")}\n          </div>".length;
console.log("Found block from", start, "to", end);
console.log("Block:", JSON.stringify(src.substring(start, end)));
