const fs = require("fs");

// Fix 1: Customer modal - replace Lifetime Value with Last Visit
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");
src = src.replace(
  "<p className='text-xs text-muted-foreground'>LIFETIME VALUE</p>\r\n                <p className='font-semibold text-success text-sm sm:text-base'>\r\n                  \u20b5{(foundCustomer.totalSpent ?? 0).toFixed(2)}\r\n                </p>\r\n                <p className='text-xs text-muted-foreground'>{foundCustomer.orderCount ?? 0} Orders</p>",
  "<p className='text-xs text-muted-foreground'>LAST VISIT</p>\r\n                <p className='font-semibold text-foreground text-sm sm:text-base'>\r\n                  {foundCustomer.lastVisit || foundCustomer.lastOrderDate ? new Date(foundCustomer.lastVisit || foundCustomer.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No previous visit'}\r\n                </p>"
);
fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Modal fixed:", !src.includes("LIFETIME VALUE") && src.includes("LAST VISIT"));

// Fix 2: Online - pass extraWashLoads/extraDryLoads
let online = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");
online = online.replace(
  "notes: notes || undefined,\r\n        } as Parameters<typeof checkInOrder>[0])",
  "notes: notes || undefined,\r\n          extraWashLoads: extraWashLoads > 0 ? extraWashLoads : undefined,\r\n          extraDryLoads: extraDryLoads > 0 ? extraDryLoads : undefined,\r\n        } as Parameters<typeof checkInOrder>[0])"
);
fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", online, "utf8");
console.log("Online extra loads fixed:", online.includes("extraWashLoads: extraWashLoads"));
