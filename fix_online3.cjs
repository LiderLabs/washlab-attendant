const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

// Replace the entire QueuePanel header section - remove Intake Queue stats, keep just the div wrapper
src = src.replace(
  `      <div className="p-4 border-b border-border">
        

      <div className="p-3 border-b border-border">`,
  `      <div className="p-3 border-b border-border">`
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Fixed");
