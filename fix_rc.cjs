const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/ReportsContent.tsx", "utf8");

// Fix 1: Auto-load soap from washerTokensUsed
src = src.replace(
  `setWasherTokens(autoData.washerTokensUsed ?? 0);`,
  `setWasherTokens(autoData.washerTokensUsed ?? 0);\n    setSoapUnits(autoData.washerTokensUsed ?? 0);`
);

// Fix 2: Reset after submit - find the toast success
const submitIdx = src.indexOf("Report submitted successfully");
console.log("submit text found:", submitIdx !== -1);

// Find what comes before it in the handler
const handleSubmitIdx = src.lastIndexOf("toast", submitIdx);
console.log("toast before:", JSON.stringify(src.substring(handleSubmitIdx - 50, handleSubmitIdx + 150)));

// Find the actual toast.success or similar call in the submit handler
const allToasts = [...src.matchAll(/toast\.(success|error)\([^)]+\)/g)];
allToasts.forEach((m, i) => console.log(i, JSON.stringify(m[0])));
