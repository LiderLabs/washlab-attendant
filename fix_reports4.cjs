const fs = require("fs");
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

// Remove the misplaced useEffect before autoData
src = src.replace(
  "// Always sync system data\n  useEffect(() => {\n    if (!autoData) return;\n    setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setDryerTokens(autoData.dryerTokensUsed ?? 0);\n    setCashAmount(autoData.cashAmount ?? 0);\n    setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);\n    setCardAmount(autoData.cardAmount ?? 0);\n    setPaystackAmount(autoData.paystackAmount ?? 0);\n  }, [autoData]);\n\n  const autoData = useQuery(",
  "const autoData = useQuery("
);

// Add it AFTER autoData declaration
src = src.replace(
  "const existingDraft = useQuery(",
  "// Always sync system data\n  useEffect(() => {\n    if (!autoData) return;\n    setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setDryerTokens(autoData.dryerTokensUsed ?? 0);\n    setCashAmount(autoData.cashAmount ?? 0);\n    setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);\n    setCardAmount(autoData.cardAmount ?? 0);\n    setPaystackAmount(autoData.paystackAmount ?? 0);\n  }, [autoData]);\n\n  const existingDraft = useQuery("
);

fs.writeFileSync("app/washstation/reports/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("Always sync system data"));
