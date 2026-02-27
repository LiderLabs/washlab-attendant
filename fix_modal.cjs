const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// Remove Lifetime Value box, replace with Last Visit
src = src.replace(
  `<div className='grid grid-cols-1 gap-3 sm:gap-4 mb-4'>
              
              <div className='bg-muted/50 rounded-xl p-3 sm:p-4'>
                <p className='text-xs text-muted-foreground'>LIFETIME VALUE</p>
                <p className='font-semibold text-success text-sm sm:text-base'>
                  ₵{(foundCustomer.totalSpent ?? 0).toFixed(2)}
                </p>
                <p className='text-xs text-muted-foreground'>{foundCustomer.orderCount ?? 0} Orders</p>
              </div>
            </div>`,
  `<div className='grid grid-cols-1 gap-3 sm:gap-4 mb-4'>
              <div className='bg-muted/50 rounded-xl p-3 sm:p-4'>
                <p className='text-xs text-muted-foreground'>LAST VISIT</p>
                <p className='font-semibold text-foreground text-sm sm:text-base'>
                  {foundCustomer.lastVisit || foundCustomer.lastOrderDate
                    ? new Date(foundCustomer.lastVisit || foundCustomer.lastOrderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "No previous visit"}
                </p>
              </div>
            </div>`
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Customer modal fixed:", src.includes("LAST VISIT") && !src.includes("LIFETIME VALUE"));
