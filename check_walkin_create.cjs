const fs = require("fs");
const src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Find where the order is created/submitted
const idx = src.indexOf("createWalkIn");
if (idx !== -1) {
  console.log("=== createWalkIn ===");
  console.log(JSON.stringify(src.substring(idx - 50, idx + 500)));
} else {
  const idx2 = src.indexOf("createOrder");
  console.log("=== createOrder ===");
  console.log(JSON.stringify(src.substring(idx2 - 50, idx2 + 500)));
}
