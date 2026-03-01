const fs = require("fs");

const files = [
  "components/washstation/OrderCard.tsx",
  "components/washstation/OrderList.tsx",
  "components/washstation/pages/NewOrderContent.tsx"
];

files.forEach(f => {
  const src = fs.readFileSync(f, "utf8");
  const idx = src.indexOf("updateStatus");
  if (idx !== -1) {
    console.log("=== " + f + " ===");
    console.log(JSON.stringify(src.substring(idx - 100, idx + 300)));
  }
  const idx2 = src.indexOf("washing");
  if (idx2 !== -1) {
    console.log("=== " + f + " washing ref ===");
    console.log(JSON.stringify(src.substring(idx2 - 100, idx2 + 200)));
  }
});
