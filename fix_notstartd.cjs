const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

// Add checked_in to isNotStarted so Start button shows for those too
src = src.replace(
  `const isNotStarted = effectiveStatus === "pending_dropoff" || effectiveStatus === "pending"`,
  `const isNotStarted = effectiveStatus === "pending_dropoff" || effectiveStatus === "pending" || effectiveStatus === "checked_in" || effectiveStatus === "sorting"`
);

fs.writeFileSync("components/washstation/OrderRowExpander.tsx", src, "utf8");
console.log("Fixed:", src.includes('"sorting"'));
