const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

// 1. Fix Last Visit - try multiple field names
src = src.replace(
  `{foundCustomer.lastVisit
                      ? new Date(foundCustomer.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric",    
year: "numeric" })
                      : "No previous visit"}`,
  `{foundCustomer.lastVisit || foundCustomer.lastOrderDate || foundCustomer.updatedAt
                      ? new Date(foundCustomer.lastVisit || foundCustomer.lastOrderDate || foundCustomer.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "No previous visit"}`
);

// 2. Remove Lifetime Value box - find and remove the second grid cell
const ltvStart = src.indexOf("<div className='bg-muted/50 rounded-xl p-3 sm:p-4'>\n                  <p className='text-xs text-muted-foreground'>LAST VISIT</p>");
const secondDivStart = src.indexOf("<div className='bg-muted/50 rounded-xl p-3 sm:p-4'>", ltvStart + 10);
const secondDivEnd = src.indexOf("</div>", secondDivStart) + "</div>".length;
if (secondDivStart !== -1) {
  src = src.substring(0, secondDivStart) + src.substring(secondDivEnd);
  console.log("Lifetime Value box removed");
} else {
  console.log("Could not find Lifetime Value box");
}

// Also change grid to single col since we removed one box
src = src.replace(
  "<div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>",
  "<div className='grid grid-cols-1 gap-3 sm:gap-4 mb-4'>"
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Done");
