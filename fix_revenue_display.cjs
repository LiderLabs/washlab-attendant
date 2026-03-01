const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Fix totalTokenRevenue to use actual revenue from system
src = src.replace(
  `const totalTokenRevenue = autoData?.totalRevenue ?? (cashAmount + mobileMoneyAmount + cardAmount + paystackAmount);`,
  `const totalTokenRevenue = autoData?.totalRevenue ?? 0;
  const totalRecorded = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;
  const discrepancy = Math.round((totalRecorded - totalTokenRevenue) * 100) / 100;`
);

// Fix totalRevenue reference (it was used as totalRevenue before)
src = src.replace(
  `const totalRevenue = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;`,
  `// totalRecorded and discrepancy calculated above`
);

// Update Token Revenue label to show system expected vs recorded
src = src.replace(
  `Token Revenue</span>\n            <span className=\"text-lg font-bold text-blue-700 dark:text-blue-300\">{fmt(totalTokenRevenue)}</span>`,
  `Expected Revenue</span>\n            <span className=\"text-lg font-bold text-blue-700 dark:text-blue-300\">{fmt(totalTokenRevenue)}</span>`
);

// Update Total Recorded to use totalRecorded
src = src.replace(
  `Total Recorded`,
  `Total Collected`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("1. totalTokenRevenue fixed:", src.includes("autoData?.totalRevenue ?? 0"));
console.log("2. discrepancy added:", src.includes("const discrepancy"));
console.log("3. totalRevenue replaced:", src.includes("calculated above"));
