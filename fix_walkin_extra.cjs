const fs = require("fs");
let src = fs.readFileSync("components/washstation/pages/NewOrderContent.tsx", "utf8");

src = src.replace(
  "isDelivery: false,\r\n      })",
  "isDelivery: false,\r\n        extraWashLoads: extraWashLoads > 0 ? extraWashLoads : undefined,\r\n        extraDryLoads: extraDryLoads > 0 ? extraDryLoads : undefined,\r\n      })"
);

fs.writeFileSync("components/washstation/pages/NewOrderContent.tsx", src, "utf8");
console.log("Done:", src.includes("extraWashLoads: extraWashLoads"));
