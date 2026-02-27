const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/OnlineOrdersContent.tsx", "utf8");

src = src.replace(
  `{extraWashLoads > 0 && (\r\n                    <div className=\"flex justify-between text-xs text-muted-foreground\">\r\n                      <span>+{extraWashLoads} extra wash`,
  `{pricing.whitesExtraLoad > 0 && (\r\n                    <div className=\"flex justify-between text-xs bg-yellow-50 text-yellow-800 rounded px-1 py-0.5\">\r\n                      <span>⚠️ Whites separate (+{pricing.whitesExtraLoad} load)</span>\r\n                      <span>GHS {(pricing.whitesExtraLoad * pricing.pricePerLoad).toFixed(2)}</span>\r\n                    </div>\r\n                  )}\r\n                  {extraWashLoads > 0 && (\r\n                    <div className=\"flex justify-between text-xs text-muted-foreground\">\r\n                      <span>+{extraWashLoads} extra wash`
);

fs.writeFileSync("components/washstation/pages/OnlineOrdersContent.tsx", src, "utf8");
console.log("Fixed:", src.includes("whitesExtraLoad > 0"));
