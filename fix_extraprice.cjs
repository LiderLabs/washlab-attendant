const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Update calculatePrice to include extra loads
src = src.replace(
  'const calculatePrice = () => {\n    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }\n    const loads = Math.ceil(weight / 8)\n    const basePrice = loads * selectedService.basePrice\n    const total = Math.round(basePrice * 100) / 100\n    return { basePrice: total, subtotal: total, total, totalPrice: total }\n  }',
  'const calculatePrice = () => {\n    if (!selectedService) return { basePrice: 0, subtotal: 0, total: 0, totalPrice: 0 }\n    const loads = Math.ceil(weight / 8)\n    const totalLoads = loads + extraWashLoads + extraDryLoads\n    const basePrice = totalLoads * selectedService.basePrice\n    const total = Math.round(basePrice * 100) / 100\n    return { basePrice: total, subtotal: total, total, totalPrice: total }\n  }'
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Price calc updated with extra loads');
