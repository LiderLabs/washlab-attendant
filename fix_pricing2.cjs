const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Fix 1: Replace calculatePrice with service-specific extra load pricing
const oldCalc = "  const calculatePrice = () => {\n    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }\n    const loads = Math.ceil((weight + (extraWashLoads + extraDryLoads) * 8) / 8)\n    const basePrice = loads * selectedService.basePrice\n    const total = Math.round(basePrice * 100) / 100\n    return { basePrice: total, subtotal: total, total, totalPrice: total }\n  }";

const newCalc = "  const washService = dbServices.find((s) => s.code === \"wash_only\")\n  const dryService = dbServices.find((s) => s.code === \"dry_only\")\n  const washPrice = washService?.basePrice ?? selectedService?.basePrice ?? 0\n  const dryPrice = dryService?.basePrice ?? selectedService?.basePrice ?? 0\n\n  const calculatePrice = () => {\n    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }\n    const loads = Math.ceil(weight / 8)\n    const basePrice = loads * selectedService.basePrice\n    const extraWashCost = extraWashLoads * washPrice\n    const extraDryCost = extraDryLoads * dryPrice\n    const total = Math.round((basePrice + extraWashCost + extraDryCost) * 100) / 100\n    return { basePrice: total, subtotal: total, total, totalPrice: total }\n  }";

if (src.includes(oldCalc)) {
  src = src.replace(oldCalc, newCalc);
  console.log("Fix 1: calculatePrice updated");
} else {
  console.log("Fix 1: pattern not found - checking what exists...");
  const idx = src.indexOf("const calculatePrice");
  console.log("calculatePrice found at char:", idx);
  console.log("Context:", src.substring(idx, idx + 300));
}

// Fix 2: Remove fixed right padding that causes layout overlap
src = src.replace(
  "className='flex-1 space-y-4 sm:space-y-6 min-w-0 pr-[22rem]'",
  "className='flex-1 space-y-4 sm:space-y-6 min-w-0'"
);

// Fix 3: Fix weight sent to backend
src = src.replace(
  "weight: weight + (extraWashLoads + extraDryLoads) * 8,",
  "weight: weight,"
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Done");
