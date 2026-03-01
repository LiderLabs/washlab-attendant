const fs = require("fs");
let src = fs.readFileSync("components/washstation/OrderRowExpander.tsx", "utf8");

// isNotStarted should include checked_in so Start button shows
// handleStart should go to washing
console.log("isNotStarted:", JSON.stringify(src.match(/const isNotStarted = .+/)?.[0]));
console.log("handleStart status:", src.includes('"washing" as OrderStatus)'));
console.log("single button:", src.includes("isNotStarted ? handleStart() : handleDone()"));
