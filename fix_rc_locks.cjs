const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Fix 1: Expected Revenue - use totalRecorded as fallback instead of 0
src = src.replace(
  `const totalTokenRevenue = autoData?.totalRevenue ?? 0;`,
  `const totalTokenRevenue = autoData?.totalRevenue ?? totalRecorded;`
);

// But totalRecorded is defined AFTER totalTokenRevenue - swap order
src = src.replace(
  `const totalTokenRevenue = autoData?.totalRevenue ?? totalRecorded;\n  const totalRecorded = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;`,
  `const totalRecorded = cashAmount + mobileMoneyAmount + cardAmount + paystackAmount;\n  const totalTokenRevenue = autoData?.totalRevenue ?? totalRecorded;`
);

// Fix 2: Lock Washer Tokens - replace editable input with display text
src = src.replace(
  `<input type="number" min={0} value={washerTokens}\n                  onChange={e => setWasherTokens(parseInt(e.target.value) || 0)}\n                  className="text-2xl font-bold bg-transparent border-none outline-none text-foregr`,
  `<p className="text-2xl font-bold text-foregr`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("1. Revenue order fixed:", src.indexOf("totalRecorded =") < src.indexOf("totalTokenRevenue ="));
console.log("2. Washer input locked:", !src.includes('onChange={e => setWasherTokens'));
