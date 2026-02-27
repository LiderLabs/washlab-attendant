const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Disable the getClockedIn query - it doesn't exist in backend
src = src.replace(
  "(api as any).attendance?.getClockedIn ?? 'skip',\n    branchId ? { branchId } : 'skip'",
  "'skip',\n    {}"
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("'skip',\n    {}"));
