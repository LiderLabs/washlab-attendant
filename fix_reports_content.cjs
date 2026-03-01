const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Fix 1: Auto-load soap from washerTokensUsed
src = src.replace(
  `setWasherTokens(autoData.washerTokensUsed ?? 0);`,
  `setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setSoapUnits(autoData.washerTokensUsed ?? 0);`
);

// Fix 2: Merge paystack into card in the breakdown
// Card payment already shows without paystack based on the UI, but paystackAmount is loaded
// Make card display cardAmount + paystackAmount
src = src.replace(
  `{ label: 'Card Payment', value: cardAmount, setter: setCardAmount, color: 'border-l-violet-500' },`,
  `{ label: 'Card Payment', value: cardAmount + paystackAmount, setter: setCardAmount, color: 'border-l-violet-500' },`
);

// Fix 3: Reset state after successful submit
src = src.replace(
  `toast.success('Daily report submitted!')`,
  `toast.success('Daily report submitted!');
      setTimeout(() => {
        setWasherTokens(0); setDryerTokens(0);
        setCashAmount(0); setMobileMoneyAmount(0); setCardAmount(0); setPaystackAmount(0);
        setSoapUnits(0); setFaults([]); setEndOfDayComment('');
        setLoaded(false);
      }, 2000`
);

fs.writeFileSync("components/washstation/pages/ReportsContent.tsx", src, "utf8");
console.log("1. Soap auto-loads:", src.includes("setSoapUnits(autoData.washerTokensUsed"));
console.log("2. Card+paystack:", src.includes("cardAmount + paystackAmount"));
console.log("3. Reset after submit:", src.includes("setLoaded(false)"));
