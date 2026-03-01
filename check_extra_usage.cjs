const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Find where the create mutation is called with args
const idx = src.indexOf("createWalkIn(");
if (idx === -1) {
  const idx2 = src.indexOf("createOrder(");
  console.log("createOrder call:", JSON.stringify(src.substring(idx2 - 50, idx2 + 800)));
} else {
  console.log("createWalkIn call:", JSON.stringify(src.substring(idx - 50, idx + 800)));
}

// Also check if extraWashLoads is used anywhere besides state declaration
const all = [...src.matchAll(/extraWashLoads|extraDryLoads/g)];
console.log("All occurrences:", all.map(m => ({ pos: m.index, ctx: src.substring(m.index - 30, m.index + 80) })));
