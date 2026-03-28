const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/DailyReportPage.tsx", "utf8");
src = src.replace(/\r\n/g, "\n");

// Fix 1: Remove the wrong soap line from the autoData sync useEffect
src = src.replace(
  "    setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setSoapUnits(autoData.washerTokensUsed ?? 0);\n    setDryerTokens(autoData.dryerTokensUsed ?? 0);",
  "    setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setDryerTokens(autoData.dryerTokensUsed ?? 0);"
);

fs.writeFileSync("components/washstation/pages/DailyReportPage.tsx", src);
console.log("soap bug fixed:", !src.includes("setSoapUnits(autoData.washerTokensUsed") ? "YES" : "NO");
