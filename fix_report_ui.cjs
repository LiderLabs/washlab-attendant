const fs = require("fs");
let src = fs.readFileSync("app/washstation/report/page.tsx", "utf8");

// 1. Remove Paystack from payment breakdown array - merge into card
src = src.replace(
  `{[['Cash', cashAmount], ['Mobile Money', mobileMoneyAmount], ['Card', cardAmount], ['Paystack', paystackAmount]].map(([label, val]) => (`,
  `{[['Cash', cashAmount], ['Mobile Money', mobileMoneyAmount], ['Card', cardAmount + paystackAmount]].map(([label, val]) => (`
);

// 2. Remove Paystack from summary array
src = src.replace(
  `['Paystack', fmt(paystackAmount)],\r\n            ['Total Revenue', fmt(totalRevenue)],`,
  `['Total Revenue', fmt(totalRevenue)],`
);

// Also handle \n variant
src = src.replace(
  `['Paystack', fmt(paystackAmount)],\n            ['Total Revenue', fmt(totalRevenue)],`,
  `['Total Revenue', fmt(totalRevenue)],`
);

// 3. Make soap auto-populate from system (washerTokens = loads = soap units)
// Replace where autoData loads are set - add soapUnits from washerTokensUsed
src = src.replace(
  `setWasherTokens(autoData.washerTokensUsed ?? 0);`,
  `setWasherTokens(autoData.washerTokensUsed ?? 0);\n        setSoapUnits(autoData.washerTokensUsed ?? 0);`
);

// 4. Make numField read-only for non-manual fields (add disabled prop)
// Replace the numField helper to support a readonly mode
src = src.replace(
  `numField = (label: string, value: number, setter: (v: number) => void, prefix = '') => (`,
  `numField = (label: string, value: number, setter: (v: number) => void, prefix = '', readonly = false) => (`
);

src = src.replace(
  `disabled={isSubmitted}
          className={\`\${prefix ? 'pl-12' : ''} text-sm\`}`,
  `disabled={isSubmitted || readonly}
          className={\`\${prefix ? 'pl-12' : ''} text-sm \${readonly ? 'opacity-60 cursor-not-allowed bg-muted' : ''}\`}`
);

// 5. Make Free Washes, Washing Plans, Technical Faults read-only (system data)
// Only Soap Units stays editable
src = src.replace(
  `{numField('Free Washes', freeWashCount, setFreeWashCount)}`,
  `{numField('Free Washes', freeWashCount, setFreeWashCount, '', true)}`
);
src = src.replace(
  `{numField('Washing Plans', washingPlanCount, setWashingPlanCount)}`,
  `{numField('Washing Plans', washingPlanCount, setWashingPlanCount, '', true)}`
);
src = src.replace(
  `{numField('Technical Faults', technicalFaults, setTechnicalFaults)}`,
  `{numField('Technical Faults', technicalFaults, setTechnicalFaults, '', true)}`
);

fs.writeFileSync("app/washstation/report/page.tsx", src, "utf8");

// Verify
console.log("1. Paystack removed from breakdown:", !src.includes("['Paystack', paystackAmount]"));
console.log("2. Card includes paystack:", src.includes("cardAmount + paystackAmount"));
console.log("3. Soap auto-loads:", src.includes("setSoapUnits(autoData.washerTokensUsed"));
console.log("4. readonly param added:", src.includes("readonly = false"));
console.log("5. Free Washes readonly:", src.includes("setFreeWashCount, '', true)"));
