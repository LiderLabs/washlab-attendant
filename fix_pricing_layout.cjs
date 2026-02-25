const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Fix 1: Better pricing - use service-specific prices for extra loads
src = src.replace(
    const calculatePrice = () => {
    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }
    const loads = Math.ceil((weight + (extraWashLoads + extraDryLoads) * 8) / 8)
    const basePrice = loads * selectedService.basePrice
    const total = Math.round(basePrice * 100) / 100
    return { basePrice: total, subtotal: total, total, totalPrice: total }
  },
    const washService = dbServices.find((s) => s.code === 'wash_only')
  const dryService = dbServices.find((s) => s.code === 'dry_only')
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
);

// Fix 2: Fix layout - remove fixed pr-[22rem] that causes overlap on tablets
src = src.replace(
  "className='flex-1 space-y-4 sm:space-y-6 min-w-0 pr-[22rem]'",
  "className='flex-1 space-y-4 sm:space-y-6 min-w-0'"
);

// Fix 3: Update extra loads display in order summary to show correct prices
src = src.replace(
                      {(extraWashLoads > 0 || extraDryLoads > 0) && (
                      <span className='block text-primary'>
                        +{extraWashLoads + extraDryLoads} extra load(s) × ₵{selectedService.basePrice.toFixed(2)}
                      </span>
                    )},
                      {extraWashLoads > 0 && (
                      <span className='block text-primary'>+{extraWashLoads} extra wash × ₵{washPrice.toFixed(2)}</span>
                    )}
                    {extraDryLoads > 0 && (
                      <span className='block text-primary'>+{extraDryLoads} extra dry × ₵{dryPrice.toFixed(2)}</span>
                    )}
);

// Fix 4: Also fix weight passed to backend - use actual weight not inflated
src = src.replace(
  'weight: weight + (extraWashLoads + extraDryLoads) * 8,',
  'weight: weight,'
);

// Fix 5: Update notes to reflect correct extra loads
fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Done');
