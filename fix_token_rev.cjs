const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Fix: totalTokenRevenue should come from autoData (actual paid amounts) not hardcoded price
src = src.replace(
  `const totalTokenRevenue = (washerTokens * 25) + (dryerTokens * 25);`,
  `const totalTokenRevenue = autoData?.totalRevenue ?? (cashAmount + mobileMoneyAmount + cardAmount + paystackAmount);`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("autoData?.totalRevenue"));
