const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Replace the remaining totalRevenue with totalRecorded
src = src.replace(
  `{fmt(totalRevenue)}</span>`,
  `{fmt(totalRecorded)}</span>`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", !src.includes("fmt(totalRevenue)"));
