const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// Check current state of paystack
console.log("Paystack in breakdown:", src.includes("paystackAmount]].map"));
console.log("Paystack in summary:", src.includes("fmt(paystackAmount)"));
console.log("Soap readonly:", src.includes("setSoapUnits, '', true)"));

// Fix 1: Soap should NOT be readonly - it auto-loads but stays editable
// (it currently uses numField without readonly so it should already be editable - confirm)
const soapIdx = src.indexOf("numField('Soap");
console.log("Soap field:", JSON.stringify(src.substring(soapIdx, soapIdx + 80)));

// Fix 2: After submit, reset state for next day
const submitIdx = src.indexOf("setIsSubmitting(false)");
console.log("After submit:", JSON.stringify(src.substring(submitIdx - 200, submitIdx + 200)));
