const fs = require("fs");
const src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

// Check 1: handleStart moves to washing
const startIdx = src.indexOf("handleStart");
console.log("handleStart:", JSON.stringify(src.substring(startIdx, startIdx + 200)));

// Check 2: isNotStarted includes checked_in and sorting
const notStartedIdx = src.indexOf("isNotStarted =");
console.log("isNotStarted:", JSON.stringify(src.substring(notStartedIdx, notStartedIdx + 150)));
