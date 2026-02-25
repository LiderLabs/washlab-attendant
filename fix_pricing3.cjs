const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Find and replace calculatePrice using indexOf/slice (avoids whitespace mismatch)
const startMarker = "const calculatePrice = () => {";
const endMarker = "  const pricing = calculatePrice()";

const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log("Markers not found. start:", startIdx, "end:", endIdx);
  process.exit(1);
}

const before = src.substring(0, startIdx);
const after = src.substring(endIdx);

const newBlock = `const washService = dbServices.find((s) => s.code === "wash_only")
  const dryService = dbServices.find((s) => s.code === "dry_only")
  const washPrice = washService?.basePrice ?? selectedService?.basePrice ?? 0
  const dryPrice = dryService?.basePrice ?? selectedService?.basePrice ?? 0

  const calculatePrice = () => {
    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }
    const loads = Math.ceil(weight / 8)
    const basePrice = loads * selectedService.basePrice
    const extraWashCost = extraWashLoads * washPrice
    const extraDryCost = extraDryLoads * dryPrice
    const total = Math.round((basePrice + extraWashCost + extraDryCost) * 100) / 100
    return { basePrice: total, subtotal: total, total, totalPrice: total }
  }

  `;

src = before + newBlock + after;
console.log("Fix 1: calculatePrice replaced");

// Fix 2: Remove fixed right padding causing layout overlap on mobile/tablet
src = src.replace(
  "className='flex-1 space-y-4 sm:space-y-6 min-w-0 pr-[22rem]'",
  "className='flex-1 space-y-4 sm:space-y-6 min-w-0'"
);
console.log("Fix 2: layout padding removed");

// Fix 3: Fix weight sent to backend (don't inflate it with extra loads)
src = src.replace(
  "weight: weight + (extraWashLoads + extraDryLoads) * 8,",
  "weight: weight,"
);
console.log("Fix 3: weight fix applied");

// Fix 4: Update extra loads summary display to show per-service prices
src = src.replace(
  "+{extraWashLoads + extraDryLoads} extra load(s) \xD7 \u20B5{selectedService?.basePrice.toFixed(2)}",
  "+{extraWashLoads} wash \xD7 \u20B5{washPrice.toFixed(2)} {extraDryLoads > 0 ? `/ +${extraDryLoads} dry \xD7 \u20B5${dryPrice.toFixed(2)}` : \"\"}"
);
console.log("Fix 4: summary display updated");

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("All done");
