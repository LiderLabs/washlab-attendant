const fs = require("fs");

// Check walk-in initial status
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
const allStatus = [...src.matchAll(/pending_dropoff|checked_in|status/g)];
allStatus.slice(0, 10).forEach(m => console.log(m.index, JSON.stringify(src.substring(m.index - 30, m.index + 80))));

// Check full OrderRowExpander
const src2 = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");
console.log("\n=== FULL EXPANDER ===");
console.log(src2);
