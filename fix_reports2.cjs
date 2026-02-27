const fs = require("fs");
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

src = src.replace(
  "if (existingDraft) {\n      setWasherTokens(existingDraft.washerTokensUsed ?? 0);\n      setDryerTokens(existingDraft.dryerTokensUsed ?? 0);\n      setCashAmount(existingDraft.cashAmount ?? 0);\n      setMobileMoneyAmount(existingDraft.mobileMoneylAmount ?? 0);\n      setCardAmount(existingDraft.cardAmount ?? 0);\n      setPaystackAmount(existingDraft.paystackAmount ?? 0);\n      setSoapUnits(existingDraft.soapUnitsUsed ?? 0);",
  "if (existingDraft) {\n      // Tokens and payments always from live system\n      if (autoData) {\n        setWasherTokens(autoData.washerTokensUsed ?? 0);\n        setDryerTokens(autoData.dryerTokensUsed ?? 0);\n        setCashAmount(autoData.cashAmount ?? 0);\n        setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);\n        setCardAmount(autoData.cardAmount ?? 0);\n        setPaystackAmount(autoData.paystackAmount ?? 0);\n      }\n      // Manual fields from draft\n      setSoapUnits(existingDraft.soapUnitsUsed ?? 0);"
);

// Also fix the else if autoData branch
src = src.replace(
  "} else if (autoData) {\n      setWasherTokens(autoData.washerTokensUsed ?? 0);\n      setDryerTokens(autoData.dryerTokensUsed ?? 0);\n      setCashAmount(autoData.cashAmount ?? 0);\n      setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);\n      setCardAmount(autoData.cardAmount ?? 0);\n      setPaystackAmount(autoData.paystackAmount ?? 0);",
  "} else if (autoData) {\n      setWasherTokens(autoData.washerTokensUsed ?? 0);\n      setDryerTokens(autoData.dryerTokensUsed ?? 0);\n      setCashAmount(autoData.cashAmount ?? 0);\n      setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);\n      setCardAmount(autoData.cardAmount ?? 0);\n      setPaystackAmount(autoData.paystackAmount ?? 0);\n      // keep this branch"
);

fs.writeFileSync("app/washstation/reports/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("Tokens and payments always from live system"));
