const fs = require('fs');
let src = fs.readFileSync('components/washstation/pages/NewOrderContent.tsx', 'utf8');

// Replace global services query with branch-specific one
src = src.replace(
  'const branchServices = useQuery(api.services.getActive) ?? []',
  'const branchId = (sessionData as any)?.branchId\n  const branchServicesRaw = useQuery(\n    (api as any).admin.getBranchServicesPublic,\n    branchId ? { branchId } : "skip"\n  ) ?? []\n  const globalServices = useQuery(api.services.getActive) ?? []\n  const branchServices = branchServicesRaw.length > 0 ? branchServicesRaw : globalServices'
);

// Fix the mapping - branchServices uses "price", global uses "basePrice"
src = src.replace(
  'basePrice: s.pricingPerKg ?? s.price ?? s.basePrice ?? 50,',
  'basePrice: s.price ?? s.pricingPerKg ?? s.basePrice ?? 50,'
);

fs.writeFileSync('components/washstation/pages/NewOrderContent.tsx', src, 'utf8');
console.log('Done');
