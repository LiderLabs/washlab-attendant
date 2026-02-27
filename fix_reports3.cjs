const fs = require("fs");
let src = fs.readFileSync("app/washstation/reports/page.tsx", "utf8");

// Always sync from autoData regardless of loaded state
src = src.replace(
  "useEffect(() => {\n    if (loaded) return;",
  "useEffect(() => {"
);

// Add a separate effect that always updates tokens/payments from autoData
src = src.replace(
  "const autoData = useQuery(",
  "// Always sync system data\n  useEffect(() => {\n    if (!autoData) return;\n    setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setDryerTokens(autoData.dryerTokensUsed ?? 0);\n    setCashAmount(autoData.cashAmount ?? 0);\n    setMobileMoneyAmount(autoData.mobileMoneylAmount ?? 0);\n    setCardAmount(autoData.cardAmount ?? 0);\n    setPaystackAmount(autoData.paystackAmount ?? 0);\n  }, [autoData]);\n\n  const autoData = useQuery("
);

fs.writeFileSync("app/washstation/reports/page.tsx", src, "utf8");
console.log("Fixed:", src.includes("Always sync system data"));
