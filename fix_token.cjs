const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

src = src.replace(
  "branchId ? { branchId, date: today() } : 'skip'\n  );",
  "branchId ? { branchId, date: today(), stationToken: stationToken || undefined } : 'skip'\n  );"
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("stationToken: stationToken"));
